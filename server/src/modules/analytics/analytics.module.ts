import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsScheduleService } from './analytics-schedule.service';
import { DataSourceModule } from '../data-source/data-source.module';
import { DataGateway } from '../../interfaces/websocket/data.gateway';
import { AutomatedAnalysisService } from './services/automated-analysis.service';
import { AnalyticsCacheService } from './services/analytics-cache.service';
import { AnalyticsAgentService } from '../../agents/analytics-agent.service';
import { LlmService } from '../../agents/llm.service';
import { WebsocketModule } from '../../interfaces/websocket/websocket.module';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MLModule } from '../../infrastructure/ml/ml.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CommonModule } from '../../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DataSourceModule,
    PrismaModule,
    WebsocketModule,
    MLModule,
    CommonModule,
    NotificationsModule,
    // CacheModule.register(),
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     host: configService.get<string>('REDIS_HOST'),
    //     port: configService.get<number>('REDIS_PORT'),
    //   }) as any,
    // }),
  ],
  providers: [
    AnalyticsService,
    AnalyticsScheduleService,
    AutomatedAnalysisService,
    // AnalyticsCacheService,
    DataGateway,
    AnalyticsAgentService,
    LlmService,
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService, AnalyticsScheduleService],
})
export class AnalyticsModule {}
