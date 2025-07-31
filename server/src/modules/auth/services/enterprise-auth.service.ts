import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from '../../../config/jwt.config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';
import { MfaService } from './mfa.service';
import { User } from '@prisma/client';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { RateLimitService } from './rate-limit.service';
import { PLANS } from '../../../config/plans.config';
import { getPlanUuid } from '../../../config/plan-ids';

@Injectable()
export class EnterpriseAuthService {
  private readonly logger = new Logger(EnterpriseAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService,
    private readonly mfaService: MfaService,
    private readonly tenantContext: TenantContextService,
    private readonly rateLimitService: RateLimitService,
  ) {}



  async generatePasswordResetToken(email: string): Promise<string> {
    // Password reset via JWT is no longer supported. Implement with Supabase or use a random token if needed.
    throw new Error('Password reset via backend JWT is no longer supported. Use Supabase password reset.');
  }

  /**
   * Resets the user's password using a valid reset token and new password.
   * @param token The reset token sent to the user's email
   * @param newPassword The new password to set
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Password reset via JWT is no longer supported. Implement with Supabase or another secure method.
    throw new Error('Password reset via backend JWT is no longer supported. Use Supabase password reset.');
  }

  /**
   * Enterprise-grade registration: creates organization, user, assigns plan, logs audit, and returns user.
   * @param registerDto Registration DTO
   */
  // Legacy registration method removed. Use Supabase Auth only.
}
