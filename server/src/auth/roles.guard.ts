import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler()) || [];
    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    // Get role from the user profile
    const userRole = user.role?.toUpperCase();
    
    if (!userRole) {
      this.logger.warn(`No role found for user ${user.id}`);
      return false;
    }

    if (!requiredRoles.includes(userRole)) {
      this.logger.warn(`User ${user.id} with role ${userRole} denied access. Required roles: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Insufficient role. Required: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
