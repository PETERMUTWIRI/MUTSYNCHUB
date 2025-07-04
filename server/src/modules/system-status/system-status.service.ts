import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemStatusService {
  async getStatus() {
    // TODO: Return current system status
    return { status: 'operational', incidents: [] };
  }
  async getHistory() {
    // TODO: Return incident history
    return [];
  }
}
