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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { StackAuthGuard } from './stack-auth.guard';
import { StackAuthService } from './stack-auth.service';
import { StackAuthBusinessService } from './stack-auth-business.service';
// Removed legacy JwtAuthGuard import

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly stackAuthService: StackAuthService,
    private readonly stackAuthBusinessService: StackAuthBusinessService,
  ) {}

  /**
  

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(StackAuthGuard)
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
  @UseGuards(StackAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user usage and plan info' })
  @ApiResponse({ status: 200, description: 'Usage and plan info' })
  async getUsage(@Request() req) {
    return this.stackAuthBusinessService.getUsageAndPlan(req.user.id);
  }

  /**
   * Get all available plans and features
   */
  @Get('plans')
  @ApiOperation({ summary: 'Get all available plans and features' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlans() {
    return this.stackAuthBusinessService.getPlans();
  }
}
