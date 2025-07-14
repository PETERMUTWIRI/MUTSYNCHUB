import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RateLimitService } from '../../modules/auth/services/rate-limit.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const user = req.user;
    const identifier = user ? user.id : ip;

    const isAllowed = await this.rateLimitService.checkRateLimit(identifier, ip);

    if (!isAllowed) {
      this.logger.warn(`Rate limit exceeded for identifier: ${identifier}, IP: ${ip}`);
      throw new HttpException('Too many requests, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }
}
