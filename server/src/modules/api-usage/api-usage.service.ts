import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class ApiUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsage(userId: string, orgId: string) {
    // Fetch current API usage for user/org
    const usage = await this.prisma.apiUsage.findFirst({
      where: {
        orgId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get org's usage limits from subscription
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true },
    });

    const limit = org?.subscription?.apiLimit ?? 1000;
    return { 
      used: usage?.count ?? 0, 
      limit,
      remaining: limit - (usage?.count ?? 0)
    };
  }

  async getUsageHistory(userId: string, orgId: string) {
    // Fetch API usage history with daily aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.apiUsage.findMany({
      where: {
        orgId,
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
