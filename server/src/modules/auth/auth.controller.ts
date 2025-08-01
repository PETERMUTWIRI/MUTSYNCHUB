import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Options,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
// Removed legacy JwtAuthGuard import

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
  
  /**
   * Sync Supabase user to Neon DB (hybrid signup flow)
   */
  @Post('sync')
  @UseGuards(AuthGuard('supabase-jwt'))
  async sync(@Req() req) {
    const { sub, email } = req.user;
    let user = await this.userService.findOrCreateFromSupabase({ id: sub, email });
    return { success: true, user };
  }

  // Supabase webhook logic removed. All user creation and updates now rely on JWT-based /api/auth/sync.

  /**
   * Get current user profile
   */
  @Get('profile')
@UseGuards(AuthGuard('supabase-jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile data' })
  async getProfile(@Request() req) {
    return req.user;
  }

  /**
   * Get current user usage and plan info
   */
  @Get('usage')
  @UseGuards(AuthGuard('supabase-jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user usage and plan info' })
  @ApiResponse({ status: 200, description: 'Usage and plan info' })
  async getUsage(@Request() req) {
    return this.authService.getUsageAndPlan(req.user.id);
  }

  /**
   * Get all available plans and features
   */
  @Get('plans')
  @ApiOperation({ summary: 'Get all available plans and features' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlans() {
    return this.authService.getPlans();
  }
}
