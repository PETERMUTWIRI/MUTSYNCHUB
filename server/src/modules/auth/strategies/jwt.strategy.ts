import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../../config/jwt.config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req) => {
        // Try cookie first
        if (req && req.cookies && req.cookies['jwt_token']) {
          return req.cookies['jwt_token'];
        }
        // Fallback to Authorization header
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      secretOrKey: jwtSettings.secret,
      ignoreExpiration: false,
      algorithms: ['HS256'], // Supabase uses HS256 by default
    });
    // Debug: confirm strategy is loaded
    // eslint-disable-next-line no-console
    console.log('JwtStrategy loaded', {
      secret: jwtSettings.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
