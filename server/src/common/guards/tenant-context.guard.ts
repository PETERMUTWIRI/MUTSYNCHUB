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

    // ✅ Skip on preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return true;
    }

    // ✅ Safely extract tenantId if present
    const headerTenantId = req.headers['x-tenant-id'];
    req.tenantId = req.user?.tenantId 
      || (Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId) 
      || null;

    // ✅ Safely assign userId if user exists
    req.userId = req.user?.id || null;

    return true;
  }
}
