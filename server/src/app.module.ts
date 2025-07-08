import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DataGateway } from './interfaces/websocket/data.gateway';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketModule } from './interfaces/websocket/websocket.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TenantContextGuard } from './common/guards/tenant-context.guard';
import { PrismaClient } from '@prisma/client';
import { NeonService } from './database/neon.service';
import { HealthController } from './modules/health/health.controller';
import { RedisService } from './database/redis.service';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [jwtConfig],
    }),
    // Database
    PrismaModule,
    // Core modules
    AuthModule,
    UserModule,
    AnalyticsModule,
    ApiKeyModule,
    PaymentsModule,
    // WebSocket modules
    EventEmitterModule.forRoot(),
    WebsocketModule,
    // Admin module (RBAC, audit logs, revenue, etc.)
    AdminModule,
    // Ensure CommonModule is available for TenantContextService
    require('./common/common.module').CommonModule,
  ],
  controllers: [HealthController],
  providers: [
    DataGateway,
    RedisService,
    JwtStrategy,
    {
      provide: PrismaClient,
      useClass: NeonService, // Replace default PrismaClient
    },
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard,
    },
    // JwtAuthGuard is no longer global; use @UseGuards(JwtAuthGuard) on protected routes only
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
  exports: [DataGateway],
})
export class AppModule {}
