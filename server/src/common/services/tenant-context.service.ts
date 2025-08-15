import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StackAuthUser } from '../interfaces/stack-auth.interface';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private user?: StackAuthUser;
  private token?: string;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  setContext(user: StackAuthUser, token: string) {
    this.user = user;
    this.token = token;
  }

  getTenantId(): string | undefined {
    return this.getUser()?.orgId;
  }

  getUserId(): string | undefined {
    return this.getUser()?.id;
  }

  getUser(): StackAuthUser | undefined {
    // Return cached user if available
    if (this.user) {
      return this.user;
    }

    // Get user from request context
    const user = (this.request as any).user;
    if (user) {
      this.user = user;
    }
    return user;
  }

  getToken(): string | undefined {
    // Return cached token if available
    if (this.token) {
      return this.token;
    }

    // Get token from request context
    const token = (this.request as any).token;
    if (token) {
      this.token = token;
    }
    return token;
  }

  hasContext(): boolean {
    const user = this.getUser();
    return !!user && !!user.id && !!user.orgId;
  }

  clearContext() {
    this.user = undefined;
    this.token = undefined;
  }
}
