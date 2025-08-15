import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from '../../modules/users/user.service';
import { StackAuthService } from './stack-auth.service';
import { RequestWithUser } from '../../types/user.types';
import { OrganizationService } from '../../modules/organization/organization.service';

@Injectable()
export class StackAuthGuard implements CanActivate {
  private readonly logger = new Logger(StackAuthGuard.name);
  constructor(
    private stackAuthService: StackAuthService,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {}

  private async createOrganizationForUser(email: string, name: string): Promise<string> {
    // Generate a unique subdomain from the email
    const subdomain = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + 
                     Math.random().toString(36).substring(2, 7);
    
    // Create the organization
    const org = await this.organizationService.create({
      name: `${name}'s Organization`,
      subdomain,
      settings: {
        createdVia: 'auto',
        createdAt: new Date().toISOString()
      }
    });

    return org.id;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token with Stack Auth
      const authUser = await this.stackAuthService.verifyToken(token);
      
      if (!authUser) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get or create user profile
      let userProfile = await this.userService.getEnrichedUserProfile(authUser.userId);
      
      if (!userProfile) {
        // Create new organization for the user
        const orgId = await this.createOrganizationForUser(
          authUser.email,
          authUser.name || 'New User'
        );

        // Create new user profile if it doesn't exist
        await this.userService.createUserProfile(authUser.userId, {
          userId: authUser.userId,
          role: 'USER', // Make them admin of their own org
          status: 'ACTIVE',
          organization: {
            connect: {
              id: orgId
            }
          }
        });
        
        userProfile = await this.userService.getEnrichedUserProfile(authUser.userId);
      }

      if (!userProfile) {
        throw new UnauthorizedException('Failed to create or retrieve user profile');
      }

      // Add the user profile to the request
      request.user = userProfile;
      
      return true;
    } catch (error) {
      this.logger.error(`Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // First try x-stack-access-token header
    const stackToken = request.headers['x-stack-access-token'];
    if (stackToken) return stackToken as string;

    // Fallback to Authorization header if needed
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
