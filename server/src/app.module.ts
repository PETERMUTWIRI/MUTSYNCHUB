import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { NeonAuthStrategy } from './modules/auth/strategies/neon-auth.strategy';
import { StackAuthGuard } from './modules/auth/stack-auth.guard';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CommonModule } from './common/common.module';
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
import { RateLimitService } from './modules/auth/services/rate-limit.service';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
  // load: [jwtConfig],
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
  // Ensure Organization and Common modules are available so global guards
  // and other providers can resolve OrganizationService and TenantContextService
  OrganizationModule,
  CommonModule,
  ],
  controllers: [HealthController],
  providers: [
    DataGateway,
    RedisService,
    NeonAuthStrategy,
    {
      provide: PrismaClient,
      useClass: NeonService, // Replace default PrismaClient
    },
    {
      provide: APP_GUARD,
      // Use the existing exported StackAuthGuard from AuthModule so its
      // dependencies (UserService, OrganizationService, etc.) are resolved
      // in the AuthModule context instead of AppModule's context.
      useExisting: StackAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
    RateLimitService,
  ],
  exports: [DataGateway],
})
export class AppModule {}
