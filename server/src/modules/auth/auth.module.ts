import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { MfaService } from './services/mfa.service';
import { RateLimitService } from './services/rate-limit.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    ConfigModule, // <-- Add ConfigModule here
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    OrganizationModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseJwtStrategy, // SupabaseJwksService removed, no longer needed
    EnterpriseAuthService,
    MfaService,
    RateLimitService,
  ],
  exports: [
    PassportModule,
    SupabaseJwtStrategy, // SupabaseJwksService removed
  ],
})
export class AuthModule {}
