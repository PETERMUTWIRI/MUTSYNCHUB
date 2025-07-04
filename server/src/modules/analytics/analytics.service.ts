import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { DataGateway } from '../../interfaces/websocket/data.gateway';
import { Dataset } from '@prisma/client';
import { AuditLoggerService } from '../../common/services/audit-logger.service';
import * as path from 'path';
import { PythonService } from '../../infrastructure/ml/python.service';
import { AnalyticsAgentService } from '../../agents/analytics-agent.service';

@Injectable()
export class AnalyticsService {
  private pythonPath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataGateway: DataGateway,
    private readonly auditLogger: AuditLoggerService,
    private readonly pythonService: PythonService, // Inject PythonService
    private readonly analyticsAgent: AnalyticsAgentService, // Inject analytics agent
  ) {
    // Path to the Python virtual environment
    this.pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
  }

  async getSupportedIndustriesAndTypes() {
    return this.pythonService.listSupportedIndustriesAndTypes();
  }

  async processDataStream(orgId: string, streamId: string, data: any) {
    try {
      // Store raw data
      const storedData = await this.prisma.dataStream.update({
        where: { id: streamId },
        data: {
          updatedAt: new Date(),
        },
        include: {
          dataSource: true,
        },
      });

      // Apply transformations if defined
      const transformedData = storedData.transformations 
        ? await this.applyTransformations(data, storedData.transformations as Record<string, any>)
        : data;

      // Broadcast real-time updates
      await this.dataGateway.broadcastToOrg(orgId, 'dataUpdate', {
        streamId,
        data: transformedData,
      });

      return transformedData;
    } catch (error) {
      console.error('Error processing data stream:', error);
      throw error;
    }
  }

  // Use the agent for all analytics queries (no separate query interpreter)
  async agentDrivenAnalysis(query: string, orgId: string, userId?: string, dataset?: any, planId?: string, ipAddress?: string, userAgent?: string) {
    // Use the production-ready analytics agent to interpret the query
    const agentInput = {
      question: query,
      tenantId: orgId,
      userId,
      // Add more context as needed (userName, userRole, jwt, etc.)
    };
    const agentResult = await this.analyticsAgent.answer(agentInput);
    // Parse agentResult.message for structured fields (fallbacks if not present)
    let analysisType = 'automated_eda';
    let industry = (dataset?.industry) || 'general';
    let parameters = {};
    let metrics: string[] = [];
    try {
      const parsed = JSON.parse(agentResult.message);
      analysisType = parsed.analysisType || analysisType;
      industry = parsed.industry || industry;
      parameters = parsed.parameters || parameters;
      metrics = parsed.metrics || metrics;
    } catch {
      // If not JSON, fallback to defaults
    }
    // Call performAnalysis with extracted fields
    return this.performAnalysis({
      dataset,
      type: analysisType,
      industry,
      parameters,
      metrics,
      orgId,
      userId,
      planId,
      ipAddress,
      userAgent,
    });
  }

  async performAnalysis(params: {
    dataset: any;
    type: string;
    industry?: string;
    parameters: Record<string, any>;
    metrics: string[];
    orgId?: string;
    userId?: string;
    planId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { dataset, type, parameters, metrics, userId, orgId, ipAddress, userAgent, industry } = params;

    // Basic validation
    if (!dataset) {
      throw new Error('Dataset is required');
    }

    // Audit log: analysis started
    if (userId) {
      await this.auditLogger.log({
        userId,
        orgId,
        action: 'analytics_run_start',
        resource: 'analytics',
        details: {
          datasetId: dataset.id,
          type,
          parameters,
          metrics,
        },
        ipAddress,
        userAgent,
      });
    }

    return new Promise((resolve, reject) => {
      // Call unified Python analytics engine via PythonService
      this.pythonService.runUnifiedAnalytics({
        data: dataset.data,
        type,
        industry,
        parameters,
        metrics
      })
        .then(async (analysisResult) => {
          // Audit log: analysis success
          if (userId) {
            await this.auditLogger.log({
              userId,
              orgId,
              action: 'analytics_run_success',
              resource: 'analytics',
              details: {
                datasetId: dataset.id,
                type,
                parameters,
                metrics,
                result: analysisResult,
              },
              ipAddress,
              userAgent,
            });
          }
          resolve(analysisResult);
        })
        .catch(async (error) => {
          // Audit log: analysis failed
          if (userId) {
            await this.auditLogger.log({
              userId,
              orgId,
              action: 'analytics_run_failure',
              resource: 'analytics',
              details: {
                datasetId: dataset.id,
                type,
                parameters,
                metrics,
                error: error.message,
              },
              ipAddress,
              userAgent,
            });
          }
          reject(new Error(`Analytics process failed: ${error.message}`));
        });
    });
  }

  private async applyTransformations(data: any, transformations: Record<string, any>) {
    // Call Python service for transformations
    return this.pythonService.runUnifiedAnalytics({
      data,
      type: 'transformation',
      parameters: { transformations },
      metrics: [],
    });
  }
}