import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from '../../modules/users/user.service';
import { StackAuthService } from './stack-auth.service';
import { OrganizationService } from '../../modules/organization/organization.service';
import { RequestWithUser } from '../../types/user.types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StackAuthGuard implements CanActivate {
  private readonly logger = new Logger(StackAuthGuard.name);
  constructor(
    private stackAuthService: StackAuthService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private prisma: PrismaService 
  ) {}

  private async createOrganizationForUser(name: string, userId: string): Promise<string> {
    const subdomainBase = userId.slice(0, 8);
    const subdomain = `${subdomainBase}-${Math.random().toString(36).substring(2, 7)}`;

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


      // Check if user profile exists
      let userProfile = await this.userService.getEnrichedUserProfile(authUser.userId);

      if (!userProfile) {
        // Check if user exists in neon_auth.users_sync
        const authUserRecord = await this.prisma.$queryRaw`
          SELECT id FROM neon_auth.users_sync 
          WHERE id = ${authUser.userId} AND deleted_at IS NULL
        `;
        if (!authUserRecord?.[0]) {
          throw new UnauthorizedException('User not found in auth system');
        }

        // Check for existing UserProfile to avoid duplicate
        const existingProfile = await this.prisma.userProfile.findUnique({
          where: { userId: authUser.userId }
        });

        if (!existingProfile) {
          // Create new organization
          const orgId = await this.createOrganizationForUser(
            authUser.name || `User-${authUser.userId.slice(0, 8)}`,
            authUser.userId
          );

          // Create new user profile
          await this.userService.createUserProfile(authUser.userId, {
            userId: authUser.userId,
            role: 'USER',
            status: 'ACTIVE',
            organization: {
              connect: {
                id: orgId
              }
            }
          });
        }

        // Fetch the user profile again
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
      throw new UnauthorizedException(`Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const stackToken = request.headers['x-stack-access-token'];
    if (stackToken) return stackToken as string;

    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}