import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Socket } from 'socket.io';
import * as jose from 'jose';
import { StackAuthUser, StackAuthTokenPayload } from '../interfaces/stack-auth.interface';

@Injectable()
export class StackAuthGuard implements CanActivate {
  private readonly logger = new Logger(StackAuthGuard.name);
  private readonly JWKS_URL = process.env.STACK_AUTH_JWKS_URL;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let token: string;
      let clientType: 'http' | 'ws';

      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        token = this.extractTokenFromRequest(request);
        clientType = 'http';
      } else if (context.getType() === 'ws') {
        const client = context.switchToWs().getClient<Socket>();
        token = this.extractTokenFromSocket(client);
        clientType = 'ws';
      } else {
        throw new UnauthorizedException('Unsupported context type');
      }
      
      const user = await this.validateToken(token);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      if (clientType === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        request.user = user;
        (request as any).token = token;
      } else {
        const client = context.switchToWs().getClient<Socket>();
        client.handshake.auth.user = user;
        client.handshake.auth.token = token;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Authentication failed: ${errorMessage}`, errorStack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromRequest(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return token;
  }

  private extractTokenFromSocket(client: Socket): string {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!token) {
      throw new UnauthorizedException('No token found in socket handshake');
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      return token.slice(7);
    }

    return token;
  }

  private async validateToken(token: string): Promise<StackAuthUser> {
    try {
      if (!this.JWKS_URL) {
        throw new Error('STACK_AUTH_JWKS_URL environment variable not set');
      }

      const JWKS = jose.createRemoteJWKSet(new URL(this.JWKS_URL));
      
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: process.env.STACK_AUTH_ISSUER,
        audience: process.env.STACK_AUTH_AUDIENCE,
      });

      const tokenPayload = payload as unknown as StackAuthTokenPayload;

      return {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        orgId: tokenPayload.org_id,
        roles: tokenPayload.roles,
        permissions: tokenPayload.permissions,
        metadata: tokenPayload.metadata,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Token validation failed: ${errorMessage}`, errorStack);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
