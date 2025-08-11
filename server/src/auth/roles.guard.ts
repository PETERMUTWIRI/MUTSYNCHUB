import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler()) || [];
    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    const role = user.clientMetadata?.role ?? (user.clientMetadata?.roles?.[0] ?? null);
    if (!role) return false;
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}
