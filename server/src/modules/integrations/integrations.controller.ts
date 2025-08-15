import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get()
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Get all integrations for the organization' })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  async getIntegrations() {
    const orgId = this.tenantContext.getTenantId();
    return this.integrationsService.getIntegrations(orgId);
  }

  @Post()
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Add a new integration' })
  @ApiResponse({ status: 201, description: 'Integration added successfully' })
  async addIntegration(@Body() data: any) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.integrationsService.addIntegration(orgId, { ...data, createdBy: userId });
  }

  @Put(':id')
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  async updateIntegration(@Param('id') id: string, @Body() data: any) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.integrationsService.updateIntegration(id, orgId, { ...data, updatedBy: userId });
  }

  @Delete(':id')
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Remove an integration' })
  @ApiResponse({ status: 200, description: 'Integration removed successfully' })
  async removeIntegration(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    return this.integrationsService.removeIntegration(id, orgId);
  }
}
