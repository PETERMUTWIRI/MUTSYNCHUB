import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiKeyService } from './api-key.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Post()
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  async createApiKey(
    @Body() data: { name: string; scopes: string[] }
  ) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.apiKeyService.createApiKey({
      ...data,
      orgId,
      createdBy: userId,
    });
  }

  @Get()
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'List all API keys for the organization' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async listApiKeys() {
    const orgId = this.tenantContext.getTenantId();
    return this.apiKeyService.listApiKeys(orgId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Delete an API key' })
  @ApiResponse({ status: 200, description: 'API key deleted successfully' })
  async deleteApiKey(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    return this.apiKeyService.deleteApiKey(id, orgId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiResponse({ status: 200, description: 'API key details' })
  async getApiKey(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    return this.apiKeyService.getApiKey(id, orgId);
  }

  @Post(':id/rotate')
  @Roles('ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Rotate an API key' })
  @ApiResponse({ status: 200, description: 'API key rotated successfully' })
  async rotateApiKey(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.apiKeyService.rotateApiKey(id, orgId, userId);
  }
}
