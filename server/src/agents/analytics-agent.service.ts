import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AgentInputDto } from './dto/agent-input.dto';
import { LlmService } from './llm.service';
import axios from 'axios';
import { TenantContextService } from '../common/services/tenant-context.service';
import { PrismaService } from '../infrastructure/persistence/prisma/prisma.service';
import { PLANS } from '../config/plans.config';

// Utility to pick chart type and config
function getVisualizationConfig(question: string, analyticsData: any) {
  if (!analyticsData) return null;
  // Example heuristics for chart selection
  if (analyticsData.values && analyticsData.labels) {
    // Time series or categorical
    if (analyticsData.labels.length > 2 && typeof analyticsData.labels[0] === 'string') {
      if (/trend|over time|growth|progress|history|timeline/i.test(question)) {
        return {
          type: 'line',
          title: analyticsData.title || 'Trend',
          labels: analyticsData.labels,
          data: analyticsData.values,
        };
      }
      return {
        type: 'bar',
        title: analyticsData.title || 'Bar Chart',
        labels: analyticsData.labels,
        data: analyticsData.values,
      };
    }
  }
  if (analyticsData.categories && analyticsData.values && analyticsData.categories.length === analyticsData.values.length) {
    // Pie chart for part-to-whole
    if (/distribution|share|portion|percentage|breakdown|pie/i.test(question)) {
      return {
        type: 'pie',
        title: analyticsData.title || 'Distribution',
        labels: analyticsData.categories,
        data: analyticsData.values,
      };
    }
  }
  if (Array.isArray(analyticsData.rows) && Array.isArray(analyticsData.columns)) {
    // Table
    return {
      type: 'table',
      title: analyticsData.title || 'Table',
      columns: analyticsData.columns,
      rows: analyticsData.rows,
    };
  }
  // Fallback: show as JSON
  return {
    type: 'json',
    title: analyticsData.title || 'Raw Data',
    data: analyticsData,
  };
}

@Injectable()
export class AnalyticsAgentService {
  constructor(
    private readonly llm: LlmService,
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Get agent query usage/progress for the current tenant/plan (for progress bar/notification).
   */
  async getAgentQueryUsage(orgId: string): Promise<{ progress: number; limit: number; count: number }> {
    // Get org and plan
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    });
    const planId = org?.planId || 'free';
    const plan = PLANS.find(p => p.id === planId) || PLANS[0];
    // Find agent query feature limit
    const agentFeature = plan.features.find(f => f.name === 'Agent Queries');
    let limit = agentFeature?.limit || 0;
    if (!limit) return { progress: 0, limit: 0, count: 0 }; // Unlimited or not monetized
    // Count agent queries this month (assume audit log or agent_query table)
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const count = await this.prisma.auditLog.count({
      where: {
        orgId,
        action: 'AGENT_QUERY',
        createdAt: { gte: startOfMonth },
      },
    });
    const progress = Math.min(count / limit, 1);
    return { progress, limit, count };
  }

  async answer(input: AgentInputDto & { jwt?: string; userId: string }) {
    if (!input.tenantId || !input.jwt) {
      throw new UnauthorizedException('Missing tenantId or JWT');
    }
    // Enforce agent query usage limits
    const usage = await this.getAgentQueryUsage(input.tenantId);
    if (usage.limit && usage.count >= usage.limit) {
      throw new UnauthorizedException('Agent query limit reached for your plan. Please upgrade to continue.');
    }
    // Fetch analytics data for the tenant from the analytics API (Codespace URL)
    const apiUrl = `https://sturdy-space-telegram-xqww959vxr72pw4j.github.dev/api/analytics/active-users?tenantId=${input.tenantId}`;
    let analyticsData;
    try {
      const resp = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${input.jwt}` },
      });
      analyticsData = resp.data;
    } catch (e) {
      analyticsData = null;
    }
    // Compose a richer prompt for the LLM
    const systemPrompt = `You are an expert enterprise analytics assistant for a multi-tenant SaaS platform.
- Always provide clear, actionable, and business-relevant insights based on the analytics data provided.
- If the user asks for a forecast, explain the trend, possible causes, and business implications.
- If the user asks for EDA, summarize key findings, outliers, and recommendations.
- Use bullet points for clarity when listing insights.
- If the user asks in Kiswahili, answer in Kiswahili. Otherwise, answer in English.
- If the data is insufficient, politely ask for more details or context.
- Always end with a practical recommendation or next step for the business user.

Tenant/Org ID: ${input.tenantId}
User: ${input.userName || 'Unknown'} (Role: ${input.userRole || 'Unknown'})
Here is the analytics data: ${JSON.stringify(analyticsData)}
`;
    const context = { systemPrompt };
    const response = await this.llm.callLLM(input.question, context);
    // Robust visualization selection
    const visualization = getVisualizationConfig(input.question, analyticsData);
    // Log agent query usage (for tracking)
    await this.prisma.auditLog.create({
      data: {
        orgId: input.tenantId,
        userId: input.userId,
        action: 'AGENT_QUERY',
        resource: 'AGENT',
        details: { question: input.question },
      },
    });
    return { role: 'assistant', message: response, visualization, usage };
  }
}
