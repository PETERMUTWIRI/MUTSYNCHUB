import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiUsageService } from './api-usage.service';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Controller('api-usage')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class ApiUsageController {
  constructor(
    private readonly apiUsageService: ApiUsageService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get()
  async getUsage() {
    const userId = this.tenantContext.getUserId();
    const orgId = this.tenantContext.getTenantId();
    return this.apiUsageService.getUsage(userId, orgId);
  }

  @Get('history')
  async getUsageHistory() {
    const userId = this.tenantContext.getUserId();
    const orgId = this.tenantContext.getTenantId();
    return this.apiUsageService.getUsageHistory(userId, orgId);
  }
}
