// src/lib/billing.ts
import { prisma } from '@/lib/prisma';
import { UsageQuota } from '@/lib/types';
import moment from 'moment';

export async function getAnalyticsUsage(orgId: string): Promise<UsageQuota> {
  const start = moment().startOf('month').toDate();
  const [exports, schedules] = await Promise.all([
    prisma.analyticsReport.count({ where: { orgId, createdAt: { gte: start }, type: 'EXPORT' } }),
    prisma.analyticsSchedule.count({ where: { orgId, createdAt: { gte: start } } }),
  ]);
  const used = exports + schedules;
  const plan = await prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
  const limit = (plan?.plan?.features as any[])?.find((f: any) => f.name === 'Analytics-Export')?.limit ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), locked: limit > 0 && used >= limit };
}

export async function enforceAnalyticsLimit(orgId: string, feature: string) {
  const usage = await getAnalyticsUsage(orgId);
  if (usage.locked) throw new Error(`${feature} limit reached – upgrade to continue.`);
}