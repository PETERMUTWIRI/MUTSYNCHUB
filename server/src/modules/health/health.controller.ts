import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get('db-status')
  async checkDB() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'OK' };
  }
}
