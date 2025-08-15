import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OrgStatus } from '@prisma/client';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Get organization by ID or current tenant' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async findById(@Param('id') id?: string) {
    const orgId = id || this.tenantContext.getTenantId();
    // Ensure user has access to the requested org
    const user = this.tenantContext.getUser();
    if (id && id !== user.orgId && !user.roles.includes('ADMIN')) {
      throw new Error('Access denied to organization');
    }
    return this.organizationService.findById(orgId);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Get organization by subdomain' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.organizationService.findBySubdomain(subdomain);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async update(
    @Body() updateDto: {
      name?: string;
      settings?: Record<string, any>;
      status?: OrgStatus;
    },
    @Param('id') id?: string,
  ) {
    // Use tenant context if id is not provided
    return this.organizationService.update(id || this.tenantContext.getTenantId(), updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  async delete(@Param('id') id?: string) {
    // Use tenant context if id is not provided
    return this.organizationService.delete(id || this.tenantContext.getTenantId());
  }
}
