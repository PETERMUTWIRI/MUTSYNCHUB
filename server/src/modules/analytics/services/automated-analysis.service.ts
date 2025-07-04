import { Injectable, Logger } from '@nestjs/common';
import { AnalysisRequestDto, AnalysisType } from '../interfaces/analysis-request.dto';
import { AnalyticsCacheService } from './analytics-cache.service';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';
import { ConnectionStateService } from '../../../interfaces/websocket/connection-state.service';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { PLANS } from '../../../config/plans.config';

@Injectable()
export class AutomatedAnalysisService {
  private readonly logger = new Logger(AutomatedAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
  
    private readonly cacheService: AnalyticsCacheService,
    private readonly connectionState: ConnectionStateService,
    private readonly tenantContext: TenantContextService, // Inject tenant context
    private readonly pythonService: any, // Inject PythonService (replace 'any' with actual type)
    private readonly notificationsService: any, // Inject NotificationsService
  ) {}

  /**
   * Enforce analytics feature usage limits for the current tenant/plan.
   * Throws if over limit. Returns progress (0-1) for frontend.
   */
  private async enforceAnalyticsLimits(orgId: string): Promise<{ progress: number; limit: number; count: number }> {
    // Get org and plan
    const org = await this.prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
    const planId = org?.planId || 'free';
    const plan = PLANS.find(p => p.id === planId) || PLANS[0];
    // Find analytics feature limit
    const analyticsFeature = plan.features.find(f => f.name === 'Analytics');
    let limit = analyticsFeature?.limit || 0;
    if (!limit) return { progress: 0, limit: 0, count: 0 }; // Unlimited or not monetized
    // Count completed analyses this month for this org (via dataset relation)
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const count = await this.prisma.analysis.count({
      where: {
        dataset: { organization: { id: orgId } },
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED',
      },
    });
    const progress = Math.min(count / limit, 1);
    if (count >= limit) {
      throw new Error('Analytics usage limit reached for your plan. Please upgrade to continue.');
    }
    return { progress, limit, count };
  }

  async runAnalysis(request: AnalysisRequestDto, orgId?: string, userId?: string): Promise<any> {
    // Use tenant context if orgId not provided
    const resolvedOrgId = orgId || this.tenantContext.getTenantId();
    const resolvedUserId = userId || this.tenantContext.getUserId();
    if (!resolvedOrgId) throw new Error('Organization not found');
    const usage = await this.enforceAnalyticsLimits(resolvedOrgId); // Enforce plan limits

    // Fetch raw data
    const dataset = await this.prisma.dataset.findUnique({ where: { id: request.datasetId } });
    if (!dataset) throw new Error(`Dataset not found: ${request.datasetId}`);

    // Create analysis record (PENDING)
    const analysis = await this.prisma.analysis.create({
      data: {
        type: request.analysisType,
        datasetId: dataset.id,
        parameters: request.parameters,
        status: 'PENDING',
      },
    });

    // Notify user/org that analysis has started (optional)
    this.broadcastAnalysisStatus(resolvedOrgId, dataset.id, analysis.id, 'PENDING');

    // Run analysis asynchronously
    (async () => {
      try {
        // Call unified Python analytics engine (replace with your PythonService call)
        // Example: const result = await this.pythonService.runUnifiedAnalytics(...)
        const result = await this.pythonService.runUnifiedAnalytics({
          data: dataset.data,
          type: request.analysisType,
          industry: request.industryType,
          parameters: request.parameters,
        });
        // Update analysis record with results
        await this.prisma.analysis.update({
          where: { id: analysis.id },
          data: { results: result, status: 'COMPLETED' },
        });
        // Notify user/org that analysis is ready
        this.broadcastAnalysisStatus(resolvedOrgId, dataset.id, analysis.id, 'COMPLETED');
        // Send notification to user
        if (resolvedUserId) {
          await this.notificationsService.createNotification({
            userId: resolvedUserId,
            orgId: resolvedOrgId,
            type: 'ANALYSIS_COMPLETED',
            title: 'Analytics Report Ready',
            message: `Your analytics report for dataset ${dataset.name} is ready to view or download.`,
            analysisId: analysis.id,
            datasetId: dataset.id,
            status: 'UNREAD',
          });
        }
      } catch (error) {
        await this.prisma.analysis.update({
          where: { id: analysis.id },
          data: { status: 'FAILED', error: (error as any)?.message || String(error) },
        });
        this.broadcastAnalysisStatus(resolvedOrgId, dataset.id, analysis.id, 'FAILED');
        this.logger.error(`Analysis failed: ${(error as any)?.message}`);
      }
    })();

    // Return analysis record (status: PENDING)
    return { analysisId: analysis.id, status: 'PENDING', usage };
  }

  // Helper to broadcast status updates
  private broadcastAnalysisStatus(orgId: string, datasetId: string, analysisId: string, status: string) {
    this.connectionState.getOrgClients(orgId).forEach(clientId => {
      this.connectionState.updateActivity(clientId);
      // Optionally, send a real-time message to the client
      // e.g., this.connectionState.send(clientId, { type: 'analysisStatus', datasetId, analysisId, status });
    });
  }
}
