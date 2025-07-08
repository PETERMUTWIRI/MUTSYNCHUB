import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException, 
  Logger,
  ForbiddenException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  // Cache for rate limiting (simple in-memory example)
  private failedAttempts = new Map<string, { count: number, lastAttempt: number }>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = request.ip || request.connection?.remoteAddress;

    // 1. Handle preflight requests
    if (request.method === 'OPTIONS') {
      return true;
    }

    // 2. Rate limiting check
    if (this.isRateLimited(clientIp)) {
      this.logger.warn(`Rate limited: IP ${clientIp}`);
      throw new ForbiddenException('Too many failed attempts. Please try again later.');
    }

    // 3. Proceed with authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const clientIp = request.ip || request.connection?.remoteAddress;

    // No need to set CORS headers here; handled globally

    // Handle different error scenarios
    if (err || !user) {
      this.recordFailedAttempt(clientIp);

      if (info instanceof TokenExpiredError) {
        this.logger.error(`Expired token from IP ${clientIp}`);
        throw new UnauthorizedException('Token has expired');
      }

      if (info instanceof JsonWebTokenError) {
        this.logger.error(`Invalid token from IP ${clientIp}: ${info.message}`);
        throw new UnauthorizedException('Invalid token');
      }

      if (err?.message === 'Tenant mismatch') {
        this.logger.warn(`Tenant violation from IP ${clientIp}`);
        throw new ForbiddenException(err.message);
      }

      this.logger.error(`Authentication failed for IP ${clientIp}: ${err?.message || info?.message}`);
      throw new UnauthorizedException('Authentication failed');
    }

    // Success - reset rate limiting
    this.resetFailedAttempts(clientIp);

    // Additional checks (example)
    if (request.headers['x-tenant-id'] && user.tenantId !== request.headers['x-tenant-id']) {
      this.logger.warn(`Tenant mismatch for user ${user.id}`);
      throw new ForbiddenException('Tenant access denied');
    }

    return user;
  }



  private isRateLimited(ip: string): boolean {
    const attempt = this.failedAttempts.get(ip);
    if (!attempt) return false;

    const now = Date.now();
    if (now - attempt.lastAttempt > this.ATTEMPT_WINDOW_MS) {
      this.failedAttempts.delete(ip);
      return false;
    }

    return attempt.count >= this.MAX_ATTEMPTS;
  }

  private recordFailedAttempt(ip: string) {
    const current = this.failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    this.failedAttempts.set(ip, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  }

  private resetFailedAttempts(ip: string) {
    this.failedAttempts.delete(ip);
  }
}