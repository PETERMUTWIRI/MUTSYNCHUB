import jose from 'jose';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StackAuthUser {
  userId: string;
  email: string;
  name: string;
}

@Injectable()
export class StackAuthService {
  private readonly logger = new Logger(StackAuthService.name);
  private jwks: ReturnType<typeof jose.createRemoteJWKSet>;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>('NEXT_PUBLIC_STACK_PROJECT_ID');
    if (!projectId) {
      this.logger.error('Stack Auth project ID not configured');
      throw new Error('Stack Auth project ID not configured');
    }

    try {
      this.jwks = jose.createRemoteJWKSet(
        new URL(`https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`)
      );
      this.logger.log('Stack Auth service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Stack Auth service', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<StackAuthUser> {
    try {
      const { payload } = await jose.jwtVerify(token, this.jwks);
      
      if (!payload.sub || !payload.email) {
        this.logger.warn('Token payload missing required fields');
        throw new UnauthorizedException('Invalid token payload');
      }

      const user: StackAuthUser = {
        userId: payload.sub,
        email: payload.email as string,
        name: payload.name as string || '',
      };

      this.logger.debug(`Token verified for user: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error('Token verification failed', error instanceof Error ? error.message : 'Unknown error');
      throw new UnauthorizedException('Invalid token');
    }
  }
}
