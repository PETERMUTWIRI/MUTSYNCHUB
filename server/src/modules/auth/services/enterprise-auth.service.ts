import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mfaService: MfaService,
    private readonly tenantContext: TenantContextService,
    private readonly rateLimitService: RateLimitService,
  ) {}



  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        resetTokenHash: true,
        resetTokenExpiresAt: true,
      },
    });

    if (!user) {
      // Return fake token to prevent email enumeration
      return this.jwtService.sign(
        { type: 'FAKE_RESET' },
        { expiresIn: '1h' }
      );
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
        type: 'PASSWORD_RESET',
      },
      { expiresIn: '1h' }
    );

    // Store token hash
    const tokenHash = await bcrypt.hash(token, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    return token;
  }

  /**
   * Resets the user's password using a valid reset token and new password.
   * @param token The reset token sent to the user's email
   * @param newPassword The new password to set
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify token and extract user id
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== 'PASSWORD_RESET' || !payload.sub) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        resetTokenHash: true,
        resetTokenExpiresAt: true,
      },
    });
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Check token expiry
    if (user.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Compare token hash
    const isValid = await bcrypt.compare(token, user.resetTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        failedLoginAttempts: 0,
        status: 'ACTIVE',
      },
    });

    // Log password reset event
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        resource: 'USER',
        details: {
          method: 'EMAIL_TOKEN',
        },
      },
    });
  }

  /**
   * Enterprise-grade registration: creates organization, user, assigns plan, logs audit, and returns user.
   * @param registerDto Registration DTO
   */
  // Legacy registration method removed. Use Supabase Auth only.
}
