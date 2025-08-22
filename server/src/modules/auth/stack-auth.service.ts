import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';

@Injectable()
export class StackAuthService {
  private readonly logger = new Logger(StackAuthService.name);
  private readonly jwks;

  constructor() {
    // Use project-specific JWKS endpoint for Stack Auth
    this.jwks = jose.createRemoteJWKSet(
      new URL('https://api.stack-auth.com/api/v1/projects/2625e66d-c556-4919-8aa1-7774c043c0e9/.well-known/jwks.json')
    );
  }

  async verifyToken(token: string): Promise<StackAuthUser> {
    try {
      // Only verify the JWT signature and decode payload
      const { payload } = await jose.jwtVerify(token, this.jwks);
      console.log('JWT Payload:', payload);

      if (!payload.sub) {
        this.logger.warn('Token payload missing sub field');
        throw new UnauthorizedException('Invalid token payload');
      }

      const user: StackAuthUser = {
        userId: payload.sub,
        email: payload.email as string | undefined, // Optional
        name: payload.name as string | undefined,  // Optional
      };

      this.logger.debug(`Token verified for user: ${user.userId}`);
      return user;
    } catch (error) {
      this.logger.error('Token verification failed', error instanceof Error ? error.message : 'Unknown error');
      throw new UnauthorizedException('Invalid token');
    }
  }
}

export interface StackAuthUser {
  userId: string;
  email?: string;
  name?: string;
}