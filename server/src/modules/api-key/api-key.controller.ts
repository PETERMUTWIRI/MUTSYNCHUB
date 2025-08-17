import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiKeyService } from './api-key.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

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
    @Body() data: CreateApiKeyDto
  ) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
  return this.apiKeyService.createApiKey(orgId, data);
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
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  async revokeApiKey(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    return this.apiKeyService.revokeApiKey(id, orgId);
  }




}
