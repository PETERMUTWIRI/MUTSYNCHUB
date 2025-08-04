import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class NeonAuthStrategy extends PassportStrategy(Strategy, 'neon-auth') {
  private readonly logger = new Logger(NeonAuthStrategy.name);

  constructor() {
    const jwksUrl = "https://api.stack-auth.com/api/v1/projects/2625e66d-c556-4919-8aa1-7774c043c0e9/.well-known/jwks.json";
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUrl,
      }),
      issuer: "https://api.stack-auth.com",
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
    this.logger.log(`Using JWKS URL for Neon Auth: ${jwksUrl}`);
  }

  async validate(payload: any) {
    this.logger.log(`Successfully validated JWT for user: ${payload.sub}`);
    // The payload structure from Neon Auth might be different.
    // We'll return the standard claims for now.
    return { id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
