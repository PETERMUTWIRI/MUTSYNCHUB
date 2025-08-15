import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MfaService } from './services/mfa.service';
import { RateLimitService } from './services/rate-limit.service';
import { StackAuthService } from './stack-auth.service';
import { StackAuthGuard } from './stack-auth.guard';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { OrganizationService } from '../organization/organization.service';
import { CommonModule } from '../../common/common.module';
import { RolesGuard } from '../../auth/roles.guard';

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
    StackAuthService,
    MfaService,
    RateLimitService,
    StackAuthGuard,
    RolesGuard,
    OrganizationService,
  ],
  exports: [
    PassportModule,
    StackAuthService,
    StackAuthGuard,
  ],
})
export class AuthModule {}
