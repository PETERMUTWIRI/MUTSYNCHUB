import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { StackAuthGuard } from '../auth/stack-auth.guard';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(StackAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getCurrentUser(@Req() req) {
    // req.user already contains the enriched user profile from the guard
    return req.user;
  }

  @Get()
  async getUsers() {
    return this.userService.getEnrichedUserProfiles({
      orderBy: { createdAt: 'desc' }
    });
  }
}
