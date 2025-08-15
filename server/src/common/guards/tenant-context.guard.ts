import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { TenantContextService } from '../services/tenant-context.service';
import { Request } from 'express';
import { StackAuthUser } from '../interfaces/stack-auth.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: StackAuthUser;
    token?: string;
  }
}

@Injectable()
export class TenantContextGuard implements CanActivate {
  private readonly logger = new Logger(TenantContextGuard.name);

  constructor(private readonly tenantContext: TenantContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const token = this.extractToken(request);

    if (!user?.id || !user?.orgId) {
      this.logger.warn('No valid Stack Auth context found in request');
      throw new UnauthorizedException('No valid Stack Auth context found');
    }

    // Set the tenant context from the Stack Auth user
    this.tenantContext.setContext(user, token);
    this.logger.debug(`Set tenant context: orgId=${user.orgId}, userId=${user.id}`);

    return true;
  }

  private extractToken(request: Request): string {
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
}
