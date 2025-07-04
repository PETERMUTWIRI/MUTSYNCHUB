import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async getIntegrations(@Req() req) {
    return this.integrationsService.getIntegrations(req.user.orgId);
  }

  @Post()
  async addIntegration(@Body() data: any, @Req() req) {
    return this.integrationsService.addIntegration(req.user.orgId, data);
  }

  @Put(':id')
  async updateIntegration(@Param('id') id: string, @Body() data: any, @Req() req) {
    return this.integrationsService.updateIntegration(id, req.user.orgId, data);
  }

  @Delete(':id')
  async removeIntegration(@Param('id') id: string, @Req() req) {
    return this.integrationsService.removeIntegration(id, req.user.orgId);
  }
}
