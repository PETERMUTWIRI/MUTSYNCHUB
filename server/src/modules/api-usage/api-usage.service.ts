import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiUsageService {
  async getUsage(userId: string) {
    // TODO: Fetch current API usage for user/org
    return { used: 0, limit: 1000 };
  }
  async getUsageHistory(userId: string) {
    // TODO: Fetch API usage history
    return [];
  }
}
