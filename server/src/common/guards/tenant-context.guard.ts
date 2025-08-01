import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface User {
    id?: string;
    tenantId?: string;
  }
  interface Request {
    user?: User;
    tenantId?: string;
    userId?: string;
  }
}

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Only use tenantId from Supabase JWT context
    req.tenantId = req.user?.tenantId || null;
    req.userId = req.user?.id || null;
    return true;
  }
}
