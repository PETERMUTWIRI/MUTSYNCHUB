// filepath: /server/src/common/services/audit-logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { TenantContextService } from './tenant-context.service';

interface AuditLogDetails {
  [key: string]: any;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async log({
    userId,
    action,
    resource,
    details = {},
    orgId,
    ipAddress,
    userAgent,
  }: {
    userId?: string;
    action: string;
    resource: string;
    details?: AuditLogDetails;
    orgId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Use context if not provided
    const resolvedUserId = userId ?? this.tenantContext.getUserId();
    const resolvedOrgId = orgId ?? this.tenantContext.getTenantId();
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: resolvedUserId,
          action,
          resource,
          details,
          ipAddress,
          userAgent,
        },
      });
      this.logger.log(`Audit log: ${action} on ${resource} by user=${resolvedUserId} org=${resolvedOrgId}`);
    } catch (err) {
      this.logger.error('Failed to log audit event', err);
    }
  }

  async getAllLogs(query: any = {}) {
    // Add filtering logic as needed (userId, action, orgId, from, to)
    const { userId, action, orgId, from, to } = query;
    return this.prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(action && { action }),
        ...(orgId && { orgId }),
        ...(from && to && { timestamp: { gte: new Date(from), lte: new Date(to) } }),
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }
}
