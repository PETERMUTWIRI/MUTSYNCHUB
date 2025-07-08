import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NeonService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect().then(() => {
      console.log('Neon connection established');
    }).catch(err => {
      console.error('Neon connection failed:', err);
      process.exit(1); // Crash app if DB is unreachable
    });
  }
}
