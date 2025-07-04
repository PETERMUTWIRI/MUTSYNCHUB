import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiUsageService } from './api-usage.service';

@Controller('api-usage')
@UseGuards(JwtAuthGuard)
export class ApiUsageController {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  @Get()
  async getUsage(@Req() req) {
    return this.apiUsageService.getUsage(req.user.id);
  }

  @Get('history')
  async getUsageHistory(@Req() req) {
    return this.apiUsageService.getUsageHistory(req.user.id);
  }
}
