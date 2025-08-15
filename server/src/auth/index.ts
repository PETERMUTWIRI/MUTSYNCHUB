import { StackAuthGuard } from '../modules/auth/stack-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

// Re-export auth components
export { StackAuthGuard, RolesGuard, Roles };

// Export a combined guard that checks both auth and roles
export const AuthAndRoles = (...roles: string[]) => {
    return {
        guards: [StackAuthGuard, RolesGuard],
        decorators: [Roles(...roles)]
    };
};
