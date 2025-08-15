import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id']; // Or however you're getting the user ID

    if (!userId) {
      throw new UnauthorizedException('No user ID provided');
    }

    // Get the enriched user profile
    const userProfile = await this.userService.getEnrichedUserProfile(userId);
    
    if (!userProfile) {
      throw new UnauthorizedException('User profile not found');
    }

    if (userProfile.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    // Add the enriched user profile to the request
    request.user = userProfile;

    return true;
  }
}
