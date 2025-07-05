import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { MfaService } from './services/mfa.service';
import { RateLimitService } from './services/rate-limit.service';
import { TokenSecurityService } from './services/token-security.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    UserModule,
    OrganizationModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EnterpriseAuthService,
    TokenBlacklistService,
    MfaService,
    RateLimitService,
    TokenSecurityService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
