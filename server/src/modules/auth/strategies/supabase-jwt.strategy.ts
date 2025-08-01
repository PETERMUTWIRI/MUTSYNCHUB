import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not set in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/keys`,
      }),
      algorithms: ['RS256', 'ES256'], // Allow both common algorithms
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT.
    // The `sub` claim is the Supabase User ID.
    // We can also get other fields like email.
    return { id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
