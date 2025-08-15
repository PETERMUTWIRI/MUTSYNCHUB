import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: string, orgId: string) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { userId, orgId },
          { orgId, isOrgWide: true }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createNotification(data: {
    title: string;
    message: string;
    type?: string;
    orgId: string;
    userId?: string;
    isOrgWide?: boolean;
    metadata?: any;
    createdBy: string;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        status: 'UNREAD'
      }
    });
  }

  async markAsRead(id: string, userId: string, orgId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        OR: [
          { userId, orgId },
          { orgId, isOrgWide: true }
        ]
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
  }
}
