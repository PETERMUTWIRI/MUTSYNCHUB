import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class NeonAuthStrategy extends PassportStrategy(Strategy, 'neon-auth') {
  private readonly logger = new Logger(NeonAuthStrategy.name);

  constructor() {
    const jwksUrl = "https://api.stack-auth.com/api/v1/projects/2625e66d-c556-4919-8aa1-7774c043c0e9/.well-known/jwks.json";
    this.logger.log(`Using JWKS URL for Neon Auth: ${jwksUrl}`);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUrl,
      }),
      // It's good practice to validate the issuer.
      // The issuer for Neon Auth is likely the base URL of the API.
      issuer: "https://api.stack-auth.com",
      algorithms: ['RS256'], // Neon Auth likely uses RS256, but we can adjust if needed
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    this.logger.log(`Successfully validated JWT for user: ${payload.sub}`);
    // The payload structure from Neon Auth might be different.
    // We'll return the standard claims for now.
    return { id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
  }
}
