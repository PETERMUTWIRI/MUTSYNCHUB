import { Injectable, Logger } from '@nestjs/common';
import { AnalysisRequestDto, AnalysisType } from '../interfaces/analysis-request.dto';
import { DataCleaningService } from './data-cleaning.service';
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
    private readonly dataCleaningService: DataCleaningService,
    private readonly cacheService: AnalyticsCacheService,
    private readonly connectionState: ConnectionStateService,
    private readonly tenantContext: TenantContextService, // Inject tenant context
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
    try {
      // Use tenant context if orgId not provided
      const resolvedOrgId = orgId || this.tenantContext.getTenantId();
      const resolvedUserId = userId || this.tenantContext.getUserId();
      if (!resolvedOrgId) throw new Error('Organization not found');
      const usage = await this.enforceAnalyticsLimits(resolvedOrgId); // Enforce plan limits

      // Generate cache key
      const cacheKey = this.cacheService.generateCacheKey(
        request.datasetId,
        request.analysisType,
        request.parameters
      );

      // Check cache first
      const cachedResult = await this.cacheService.getCachedAnalysis(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Fetch raw data
      const dataset = await this.prisma.dataset.findUnique({
        where: { id: request.datasetId },
      });

      if (!dataset) {
        throw new Error(`Dataset not found: ${request.datasetId}`);
      }

      // Clean data
      const cleanedData = await this.dataCleaningService.cleanData(
        dataset.data,
        request.industryType
      );

      // Initialize analysis result
      let analysisResult: any = {};

      // Perform requested analysis
      switch (request.analysisType) {
        case AnalysisType.AUTOMATED_EDA:
          analysisResult = await this.performEDA(cleanedData, request.parameters);
          break;
        case AnalysisType.FORECASTING:
          analysisResult = await this.performForecasting(cleanedData, request.parameters);
          break;
        case AnalysisType.FULL_ANALYSIS:
          analysisResult = await this.performFullAnalysis(cleanedData, request.parameters);
          break;
      }

      // Cache results
      await this.cacheService.cacheAnalysisResult(cacheKey, analysisResult);
      // Log analysis usage for tracking (audit log)
      await this.prisma.auditLog.create({
        data: {
          orgId: resolvedOrgId,
          userId: resolvedUserId,
          action: 'ANALYSIS_RUN',
          resource: 'ANALYTICS',
          details: { datasetId: request.datasetId, analysisType: request.analysisType },
        },
      });
      // Broadcast analysis completion to organization
      this.broadcastAnalysisComplete(resolvedOrgId, request.datasetId, analysisResult);

      // Optionally return usage/progress for frontend
      return { ...analysisResult, usage };
    } catch (error) {
      const errMsg = (error as any)?.message || error;
      this.logger.error(`Error running analysis: ${errMsg}`);
      throw error;
    }
  }

  private async performEDA(data: any[], parameters: any): Promise<any> {
    // Implement EDA using Python script execution or direct JS implementation
    // This is a placeholder for the actual implementation
    return {
      summary: {
        rowCount: data.length,
        columnStats: this.calculateColumnStats(data),
      }
    };
  }

  private async performForecasting(data: any[], parameters: any): Promise<any> {
    // Implement Prophet forecasting using Python script execution
    // This is a placeholder for the actual implementation
    return {
      forecast: {
        predictions: [],
        metadata: {}
      }
    };
  }

  private async performFullAnalysis(data: any[], parameters: any): Promise<any> {
    const [eda, forecast] = await Promise.all([
      this.performEDA(data, parameters),
      this.performForecasting(data, parameters)
    ]);

    return {
      eda,
      forecast,
      correlations: this.calculateCorrelations(data)
    };
  }

  private calculateColumnStats(data: any[]): any {
    // Calculate basic statistics for each column
    const stats = {};
    if (data.length === 0) return stats;

    const columns = Object.keys(data[0]);
    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(v => v != null);
      stats[column] = {
        count: values.length,
        missing: data.length - values.length,
        type: this.inferColumnType(values)
      };

      if (this.isNumericArray(values)) {
        stats[column] = {
          ...stats[column],
          mean: this.calculateMean(values),
          std: this.calculateStd(values),
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    return stats;
  }

  private calculateCorrelations(data: any[]): any {
    // Calculate correlations between numeric columns
    const correlations = {};
    if (data.length === 0) return correlations;

    const numericColumns = Object.keys(data[0]).filter(column => 
      this.isNumericArray(data.map(row => row[column]))
    );

    numericColumns.forEach(col1 => {
      correlations[col1] = {};
      numericColumns.forEach(col2 => {
        correlations[col1][col2] = this.calculatePearsonCorrelation(
          data.map(row => row[col1]),
          data.map(row => row[col2])
        );
      });
    });

    return correlations;
  }

  private inferColumnType(values: any[]): string {
    if (values.length === 0) return 'unknown';
    if (this.isNumericArray(values)) return 'numeric';
    if (this.isDateArray(values)) return 'date';
    return 'categorical';
  }

  private isNumericArray(arr: any[]): boolean {
    return arr.every(v => typeof v === 'number' && !isNaN(v));
  }

  private isDateArray(arr: any[]): boolean {
    return arr.every(v => !isNaN(Date.parse(v)));
  }

  private calculateMean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private calculateStd(arr: number[]): number {
    const mean = this.calculateMean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squareDiffs));
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);
    const n = x.length;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      numerator += xDiff * yDiff;
      denominatorX += xDiff * xDiff;
      denominatorY += yDiff * yDiff;
    }

    return numerator / Math.sqrt(denominatorX * denominatorY);
  }

  private broadcastAnalysisComplete(orgId: string, datasetId: string, result: any) {
    // Get all clients for this organization
    const clients = this.connectionState.getOrgClients(orgId);
    
    // Broadcast to all connected clients
    clients.forEach(clientId => {
      const state = this.connectionState.getClientState(clientId);
      if (state && state.subscriptions.has(`dataset:${datasetId}`)) {
        this.connectionState.updateActivity(clientId);
      }
    });
  }
}
