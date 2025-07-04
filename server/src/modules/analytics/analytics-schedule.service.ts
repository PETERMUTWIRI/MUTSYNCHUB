import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { AuditLoggerService } from '../../common/services/audit-logger.service';
import { AnalyticsService } from './analytics.service';
import { CronJob } from 'cron';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { PLANS } from '../../config/plans.config';

@Injectable()
export class AnalyticsScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly analyticsService: AnalyticsService,
    private readonly auditLogger: AuditLoggerService,
    private readonly tenantContext: TenantContextService,
    private readonly notificationsService: any, // Inject NotificationsService
  ) {}

  async createSchedule(data: { frequency: string; interval?: number; }) {
    // Use tenant context for orgId
    const orgId = this.tenantContext.getTenantId();
    if (!orgId) throw new Error('Organization context not found');
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');
    // Get allowed frequencies from plan config
    const plan = PLANS.find(p => p.id === org.planId) || PLANS[0];
    const allowedFrequencies = plan.features
      .find(f => f.name === 'Scheduling')?.allowedFrequencies || ['weekly'];
    if (!allowedFrequencies.includes(data.frequency)) {
      throw new Error(`Your current plan (${plan.name}) only allows: ${allowedFrequencies.join(', ')} schedules.`);
    }
    const schedule = await this.prisma.analyticsSchedule.create({
      data: {
        orgId,
        frequency: data.frequency,
        interval: data.interval,
      },
    });
    this.setupScheduledJob(schedule);
    await this.auditLogger.log({
      userId: 'system',
      orgId,
      action: 'ANALYTICS_SCHEDULE_CREATED',
      resource: 'ANALYTICS_SCHEDULE',
      details: { scheduleId: schedule.id, frequency: data.frequency, interval: data.interval },
    });
    return schedule;
  }

  async getSchedules(orgId: string) {
    return this.prisma.analyticsSchedule.findMany({
      where: { orgId },
    });
  }

  async updateSchedule(id: string, data: {
    frequency?: string;
    interval?: number;
  }) {
    // Enforce frequency limits by org tier
    const schedule = await this.prisma.analyticsSchedule.findUnique({ where: { id } });
    if (!schedule) throw new Error('Schedule not found');
    const org = await this.prisma.organization.findUnique({ where: { id: schedule.orgId } });
    if (!org) throw new Error('Organization not found');
    const tier = org.planId || 'free';
    const allowedFrequencies: Record<string, string[]> = {
      STARTER: ['weekly'],
      BUSINESS: ['daily', 'weekly'],
      CORPORATE: ['hourly', 'daily', 'weekly', 'monthly', 'custom'],
    };
    if (data.frequency && !allowedFrequencies[tier].includes(data.frequency)) {
      throw new Error(`Your current plan (${tier}) only allows: ${allowedFrequencies[tier].join(', ')} schedules.`);
    }
    const updated = await this.prisma.analyticsSchedule.update({
      where: { id },
      data,
    });
    try {
      this.schedulerRegistry.deleteCronJob(`analytics_${updated.id}`);
    } catch (err) {}
    this.setupScheduledJob(updated);
    await this.auditLogger.log({
      userId: 'system',
      orgId: updated.orgId,
      action: 'ANALYTICS_SCHEDULE_UPDATED',
      resource: 'ANALYTICS_SCHEDULE',
      details: { scheduleId: updated.id, ...data },
    });
    return updated;
  }

  async deleteSchedule(id: string) {
    const schedule = await this.prisma.analyticsSchedule.delete({
      where: { id },
    });

    // Remove the scheduled job
    try {
      this.schedulerRegistry.deleteCronJob(`analytics_${id}`);
    } catch (err) {
      // Job might not exist
    }

    await this.auditLogger.log({
      userId: 'system',
      orgId: schedule.orgId,
      action: 'ANALYTICS_SCHEDULE_DELETED',
      resource: 'ANALYTICS_SCHEDULE',
      details: { scheduleId: schedule.id },
    });

    return schedule;
  }

  private setupScheduledJob(schedule: {
    id: string;
    frequency: string;
    interval?: number;
  }) {
    const cronExpression = this.getCronExpression(schedule.frequency, schedule.interval);
    const job = new CronJob(cronExpression, () => {
      this.runAnalytics(schedule.id);
    });

    this.schedulerRegistry.addCronJob(`analytics_${schedule.id}`, job);
    job.start();
  }

  private getCronExpression(frequency: string, interval?: number): string {
    switch (frequency) {
      case 'hourly':
        return '0 * * * *';
      case 'daily':
        return '0 0 * * *';
      case 'weekly':
        return '0 0 * * 0';
      case 'monthly':
        return '0 0 1 * *';
      case 'custom':
        if (!interval) throw new Error('Interval required for custom frequency');
        // Convert interval (minutes) to cron expression
        return `*/${interval} * * * *`;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  private async runAnalytics(scheduleId: string) {
    // Get the schedule and associated organization
    const schedule = await this.prisma.analyticsSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        organization: {
          include: {
            datasets: true,  // Include datasets for analysis
          }
        },
      },
    });

    if (!schedule) {
      console.error(`Schedule ${scheduleId} not found`);
      return;
    }

    try {
      // For each dataset in the organization
      for (const dataset of schedule.organization.datasets) {
        // Run comprehensive analysis
        const analysisResults = await this.analyticsService.performAnalysis({
          dataset,
          type: 'comprehensive',  // Default to comprehensive analysis for scheduled runs
          parameters: {},
          metrics: ['all']  // Analyze all available metrics
        });

        // Generate user-friendly summary and examples
        const summary = `Analysis complete for dataset ${dataset.name}. Key findings: ...`;
        const insights = [
          'Insight 1: ...',
          'Insight 2: ...',
        ];
        const examples = [
          `"Show me trends for ${dataset.name} in the last month"`,
          `"What are the top metrics for ${dataset.name}?"`,
        ];
        // Store report in the database (no agent involved)
        await this.prisma.analyticsReport.create({
          data: {
            name: `Scheduled Analysis - ${schedule.frequency}`,
            description: `Automated analysis for dataset ${dataset.name}`,
            orgId: schedule.orgId,
            type: schedule.frequency,
            config: {
              scheduleId: schedule.id,
              datasetId: dataset.id,
              analysisType: 'comprehensive'
            },
            results: {
              summary,
              insights,
              examples,
              raw: JSON.parse(JSON.stringify(analysisResults)) // Ensure LLM/JSON compatibility
            },
            lastRun: new Date(),
          },
        });
        // Notify user/org (no agent, just notification)
        await this.notificationsService.createNotification({
          orgId: schedule.orgId,
          type: 'SCHEDULED_ANALYSIS_COMPLETED',
          title: 'Scheduled Analytics Report Ready',
          message: `A scheduled analytics report for dataset ${dataset.name} is ready to view or query.`,
          scheduleId: schedule.id,
          datasetId: dataset.id,
          status: 'UNREAD',
        });
        await this.auditLogger.log({
          userId: 'system',
          orgId: schedule.orgId,
          action: 'ANALYTICS_RUN',
          resource: 'ANALYTICS',
          details: {
            scheduleId: schedule.id,
            datasetId: dataset.id,
            type: 'comprehensive',
            status: 'SUCCESS',
          },
        });
      }

      // Update lastRun timestamp
      await this.prisma.analyticsSchedule.update({
        where: { id: scheduleId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error(`Error running analytics for schedule ${scheduleId}:`, error);
      // Store error in report
      await this.prisma.analyticsReport.create({
        data: {
          name: `Failed Analysis - ${schedule.frequency}`,
          description: `Failed automated analysis run`,
          orgId: schedule.orgId,
          type: schedule.frequency,
          config: {
            scheduleId: schedule.id,
            error: true
          },
          results: { error: (error as any).message },
          lastRun: new Date(),
        },
      });
      // Audit log: analysis run failed
      await this.auditLogger.log({
        userId: 'system',
        orgId: schedule.orgId,
        action: 'ANALYTICS_RUN_FAILED',
        resource: 'ANALYTICS',
        details: {
          scheduleId: schedule.id,
          error: (error as any).message,
        },
      });
    }
  }
}
