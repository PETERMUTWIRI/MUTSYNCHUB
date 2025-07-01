import { Injectable } from '@nestjs/common';
import { AgentInputDto } from './dto/agent-input.dto';
import { ClassifierService } from './classifier.service';
import { AnalyticsAgentService } from './analytics-agent.service';
import { GlobalSupportAgentService } from './global-support-agent.service';
import { TenantContextService } from '../common/services/tenant-context.service';

@Injectable()
export class AgentRunnerService {
  constructor(
    private readonly classifier: ClassifierService,
    private readonly analyticsAgent: AnalyticsAgentService,
    private readonly supportAgent: GlobalSupportAgentService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async handleQuestion(input: AgentInputDto & { jwt?: string }) {
    // Inject userId and tenantId from context if missing
    const userId = input.userId || this.tenantContext.getUserId();
    const tenantId = input.tenantId || this.tenantContext.getTenantId();
    const jwt = input.jwt;
    const scenario = await this.classifier.classify(input.question, input);
    if (scenario === 'analytics') {
      return this.analyticsAgent.answer({ ...input, userId, tenantId, jwt });
    } else {
      return this.supportAgent.answer({ ...input, userId, tenantId, jwt });
    }
  }
}
