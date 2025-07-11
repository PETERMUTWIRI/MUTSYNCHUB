import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../../config/jwt.config';
import { UserService } from '../../user/user.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req) => {
        // Check for token in cookie first
        if (req?.cookies?.['jwt_token']) {
          return req.cookies['jwt_token'];
        }
        // Fallback: Authorization: Bearer <token>
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      secretOrKey: jwtSettings.secret, // uses SUPABASE_JWT_SECRET from env
      algorithms: ['HS256'],
      ignoreExpiration: false,
    });

    this.logger.debug('✅ JwtStrategy initialized with HS256');
  }

  /**
   * Validate decoded payload
   * @param payload Decoded JWT payload
   */
  async validate(payload: any) {
    this.logger.verbose(`🔑 Validating user with sub: ${payload.sub}, email: ${payload.email}`);

    // Find user in Neon DB using Prisma
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      this.logger.warn(`⚠️ User not found in Neon for sub: ${payload.sub}`);
      throw new UnauthorizedException('User not found. Possibly out of sync.');
    }

    // Additional checks could go here (e.g., status, tenant)
    this.logger.debug(`✅ User validated: ${user.email}`);

    return user;
  }
}
