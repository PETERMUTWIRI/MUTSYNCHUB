import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { MfaService } from './mfa.service';
import { User } from '@prisma/client';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { RateLimitService } from './rate-limit.service';
import { TokenSecurityService } from './token-security.service';
import { PLANS } from '../../../config/plans.config';

@Injectable()
export class EnterpriseAuthService {
  private readonly logger = new Logger(EnterpriseAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly mfaService: MfaService,
    private readonly tenantContext: TenantContextService,
    private readonly rateLimitService: RateLimitService,
    private readonly tokenSecurityService: TokenSecurityService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Rate limit login attempts per tenant/user/IP
    const allowed = await this.rateLimitService.checkRateLimit(email, this.tenantContext.getTenantId() || 'unknown');
    if (!allowed) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      // Audit log failed login
      await this.prisma.auditLog.create({
        data: {
          userId: null,
          orgId: this.tenantContext.getTenantId(),
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          details: { reason: 'Invalid credentials', email },
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          orgId: user.orgId,
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          details: { reason: 'Account is not active', email },
        },
      });
      throw new UnauthorizedException('Account is not active');
    }

    // Plan enforcement: check if login is allowed for this plan
    // Get plan name from organization relation (planId -> PLANS)
    let planName = 'Free';
    if (user.organization && user.organization.planId) {
      const planObj = PLANS.find(p => p.id === user.organization.planId || p.name === user.organization.planId);
      planName = planObj?.name || planName;
    }
    // Example: block login for Free plan (customize as needed)
    if (planName === 'Free') {
      // You can add more granular feature checks here if needed
      throw new UnauthorizedException('Login not allowed for your plan');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id);
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          orgId: user.orgId,
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          details: { reason: 'Invalid credentials', email },
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.resetFailedAttempts(user.id);

    // Audit log successful login
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: user.orgId,
        action: 'LOGIN_SUCCESS',
        resource: 'AUTH',
        details: { method: 'PASSWORD', email },
      },
    });

    return user;
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        failedLoginAttempts: true,
      },
    });

    if (user.failedLoginAttempts >= 5) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          lastLoginAt: new Date(),
        },
      });

      // Log security event
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'ACCOUNT_SUSPENDED',
          resource: 'USER',
          details: {
            reason: 'Too many failed login attempts',
            attempts: user.failedLoginAttempts,
          },
        },
      });
    }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      },
    });
  }

  async login(user: User, mfaToken?: string): Promise<any> {
    // Check if MFA is required
    if (user.mfaEnabled && !mfaToken) {
      return {
        requiresMFA: true,
        tempToken: this.jwtService.sign(
          { id: user.id, type: 'MFA_REQUIRED' },
          { expiresIn: '5m' }
        ),
      };
    }

    // Validate MFA if enabled
    if (user.mfaEnabled) {
      const { verified } = await this.mfaService.verifyMfa(user.id, mfaToken);
      if (!verified) {
        throw new UnauthorizedException('Invalid MFA token');
      }
    }

    const tokens = await this.generateTokens(user);
    
    // Log successful login
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'AUTH',
        details: {
          method: user.mfaEnabled ? 'MFA' : 'PASSWORD',
        },
      },
    });

    return tokens;
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        },
        {
          expiresIn: '15m',
          secret: this.configService.get('JWT_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'refresh',
        },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    // Store refresh token hash
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        // Remove select: return full user object for generateTokens
      });

      // Verify stored refresh token hash
      const isValidToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Blacklist the refresh token
    await this.tokenBlacklistService.blacklist(refreshToken);

    // Clear refresh token hash
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
      },
    });

    // Log logout
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'AUTH',
        details: {
          method: 'EXPLICIT',
        },
      },
    });
  }

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
  async registerUserAndOrg(registerDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    subdomain: string;
    planId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Check if org or user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    const existingOrg = await this.prisma.organization.findUnique({ where: { subdomain: registerDto.subdomain } });
    if (existingOrg) {
      throw new UnauthorizedException('Organization subdomain already exists');
    }
    // Create organization
    const org = await this.prisma.organization.create({
      data: {
        name: registerDto.organizationName,
        subdomain: registerDto.subdomain,
        planId: registerDto.planId || PLANS[0].id,
        status: 'ACTIVE',
      },
    });
    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        orgId: org.id,
        status: 'ACTIVE',
        role: 'ADMIN', // Use a valid UserRole enum value
      },
    });
    // Audit log registration
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: org.id,
        action: 'REGISTER',
        resource: 'USER',
        details: {
          email: user.email,
          org: org.name,
          subdomain: org.subdomain,
        },
        ipAddress: registerDto.ipAddress,
        userAgent: registerDto.userAgent,
      },
    });
    return user;
  }
}
