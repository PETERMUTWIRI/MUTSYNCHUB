import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  private readonly logger = new Logger(SupabaseJwtStrategy.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    this.logger.log(`Supabase URL from env: ${supabaseUrl}`);

    if (!supabaseUrl) {
      this.logger.error('Supabase URL is not set in environment variables. Auth will not work.');
      throw new Error('Supabase URL is not set in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: (req, jwt, done) => {
        const client = passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `${supabaseUrl}/auth/v1/keys`,
        });

        client(req, jwt, (err, secret) => {
            if (err) {
                this.logger.error('Error from jwks-rsa client: ', err);
            }
            done(err, secret);
        });
      },
      algorithms: ['RS256', 'ES256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    this.logger.log(`Successfully validated JWT for user: ${payload.sub}`);
    return { id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
