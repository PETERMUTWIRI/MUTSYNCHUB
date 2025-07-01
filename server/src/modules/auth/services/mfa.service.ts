import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async generateMfaSecret(userId: string) {
    const secret = speakeasy.generateSecret({ length: 20 });
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaPendingSecret: secret.base32 },
    });
    const otpauthUrl = secret.otpauth_url;
    const qrCode = await qrcode.toDataURL(otpauthUrl);
    return { secret: secret.base32, otpauthUrl, qrCode };
  }

  async enableMfa(userId: string, token: string) {
    const user = await this.userService.findById(userId);
    if (!user?.mfaPendingSecret) throw new BadRequestException('No pending MFA setup.');
    const verified = speakeasy.totp.verify({
      secret: user.mfaPendingSecret,
      encoding: 'base32',
      token,
    });
    if (!verified) throw new UnauthorizedException('Invalid MFA token.');
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: user.mfaPendingSecret,
        mfaPendingSecret: null,
        mfaEnabled: true,
        mfaBackupCodes: JSON.stringify(this.generateBackupCodes()),
      },
    });
    return { enabled: true };
  }

  async disableMfa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: null,
        mfaEnabled: false,
        mfaBackupCodes: null,
      },
    });
    return { disabled: true };
  }

  async verifyMfa(userId: string, token: string) {
    const user = await this.userService.findById(userId);
    if (!user?.mfaSecret) throw new UnauthorizedException('MFA not enabled.');
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });
    return { verified };
  }

  async useBackupCode(userId: string, code: string) {
    const user = await this.userService.findById(userId);
    if (!user?.mfaBackupCodes) throw new UnauthorizedException('No backup codes.');
    const codes: string[] = JSON.parse(user.mfaBackupCodes);
    if (!codes.includes(code)) throw new UnauthorizedException('Invalid backup code.');
    // Remove used code
    const newCodes = codes.filter(c => c !== code);
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: JSON.stringify(newCodes) },
    });
    return { used: true, remaining: newCodes.length };
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 5 }, () => Math.random().toString(36).slice(-8));
  }
}
