import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request interface to include tenantId and userId
declare module 'express-serve-static-core' {
  interface User {
    id?: string;
    tenantId?: string;
    // add other user properties as needed
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
    // Extract tenantId from JWT payload (req.user) or header, always as string
    const headerTenantId = req.headers['x-tenant-id'];
    req.tenantId = req.user?.tenantId || (Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId);
    req.userId = req.user?.id;
    return true;
  }
}
