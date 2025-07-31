import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import jwtConfig from '../../config/jwt.config';
// import { ConfigType } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { MfaService } from './services/mfa.service';
import { RateLimitService } from './services/rate-limit.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { SupabaseJwksService } from './supabase-jwks.service';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.registerAsync({
    //   inject: [jwtConfig.KEY],
    //   useFactory: (jwtSettings: ConfigType<typeof jwtConfig>) => ({
    //     secret: jwtSettings.secret,
    //     signOptions: {
    //       expiresIn: jwtSettings.expiresIn,
    //     },
    //   }),
    // }),
    UserModule, // <-- ensure UserModule is imported
    OrganizationModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseJwtStrategy,
    SupabaseJwksService,
    EnterpriseAuthService,
    MfaService,
    RateLimitService,
  ],
  exports: [
    PassportModule,
    SupabaseJwtStrategy,
    SupabaseJwksService,
  ],
})
export class AuthModule {}
