import { Injectable, Scope, Inject, forwardRef } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getTenantId(): string | undefined {
    // @ts-ignore
    return this.request.tenantId;
  }
  getUserId(): string | undefined {
    // @ts-ignore
    return this.request.userId;
  }
  getUser(): any {
    return this.request.user;
  }
}
