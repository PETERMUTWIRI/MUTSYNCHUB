import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'], // Explicitly set the algorithm to HS256
    });
  }

  /**
   * Validates the JWT payload.
   * This method is called by passport after a token has been successfully verified.
   * The returned value is attached to the request object as `req.user`.
   * @param payload The decoded JWT payload
   * @returns The user object to be attached to the request
   */
  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // The payload from a Supabase JWT is already validated at this point.
    // We can trust its contents.
    // We return an object with the user's Supabase ID (sub) and email.
    return { sub: payload.sub, email: payload.email };
  }
}
