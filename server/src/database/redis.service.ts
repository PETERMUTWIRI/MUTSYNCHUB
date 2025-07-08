import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  public client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(redisUrl);
  }

  async onModuleInit() {
    this.client.on('connect', () => {
      this.logger.log('Redis connection established');
    });
    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }
}
