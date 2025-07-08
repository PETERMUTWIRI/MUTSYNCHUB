import { Controller, Post, Body, UseGuards, Get, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and organization' })
  @ApiResponse({ status: 201, description: 'Successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  // Legacy register endpoint removed. Use Supabase Auth only.

  // Legacy login endpoint removed. Use Supabase Auth only.

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile data' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user usage and plan info' })
  @ApiResponse({ status: 200, description: 'Usage and plan info' })
  async getUsage(@Request() req) {
    return this.authService.getUsageAndPlan(req.user.id);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all available plans and features' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlans() {
    return this.authService.getPlans();
  }
}
