import { Controller, Get } from '@nestjs/common';
import { SystemStatusService } from './system-status.service';

@Controller('system-status')
export class SystemStatusController {
  constructor(private readonly systemStatusService: SystemStatusService) {}

  @Get()
  async getStatus() {
    return this.systemStatusService.getStatus();
  }

  @Get('history')
  async getHistory() {
    return this.systemStatusService.getHistory();
  }
}
