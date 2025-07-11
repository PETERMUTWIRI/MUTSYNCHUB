import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Options,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * Handle CORS preflight explicitly for /auth/exchange
   */
  @Options('exchange')
  @HttpCode(200)
  handleOptionsExchange() {
    // Respond immediately; Nest will send 200 OK.
    return;
  }

  /**
   * Exchange Supabase JWT for backend JWT (with Neon sync)
   */
  @Post('exchange')
  async exchange(@Body('token') supabaseToken: string, @Request() req) {
    console.log(`[EXCHANGE] Received Supabase JWT:`, supabaseToken?.slice(0, 32) + '...');
    console.log(`[EXCHANGE] Request headers:`, req.headers);

    // 1. Parse Supabase token payload
    let payload: any;
    try {
      const [header, body, signature] = supabaseToken.split('.');
      if (!header || !body || !signature) throw new Error('Malformed JWT');

      let decoded = Buffer.from(body, 'base64url').toString('utf8');
      payload = JSON.parse(decoded);
    } catch (err) {
      return {
        error: 'Invalid Supabase token',
        details: err instanceof Error ? err.message : String(err),
      };
    }

    // 2. Find or create user in Neon DB
    let user = await this.userService.findById(payload.sub);
    if (!user) {
      user = await this.userService.findOrCreateFromSupabase({
        id: payload.sub,
        email: payload.email,
      });
    }

    // 3. Issue backend JWT
    const backendJwt = this.authService.signJwt({
      sub: user.id,
      role: user.role,
      orgId: user.orgId,
    });

    return { token: backendJwt, user };
  }

  /**
   * Supabase webhook: sync users on signup/update
   */
  @Post('supabase-webhook')
  async handleSupabaseWebhook(@Body() body: any) {
    console.log('Supabase webhook received:', JSON.stringify(body));

    if (body.event === 'user.created' || body.event === 'user.updated') {
      try {
        await this.userService.findOrCreateFromSupabase({
          id: body.user.id,
          email: body.user.email,
        });
        console.log('User sync success:', body.user.email);
      } catch (err) {
        console.error('User sync error:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    return { success: true };
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
