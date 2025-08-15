import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLoggerService } from '../../common/services/audit-logger.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';

@ApiTags('Admin Audit Logs')
@Controller('admin/audit-logs')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class AuditLogController {
  constructor(
    private readonly auditLogger: AuditLoggerService,
    private readonly tenantContext: TenantContextService
  ) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get audit logs with optional filters' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  async getAuditLogs(@Query() query: any) {
    const orgId = this.tenantContext.getTenantId();
    return this.auditLogger.getAllLogs({
      ...query,
      orgId
    });
  }
}
