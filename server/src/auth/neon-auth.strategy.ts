import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

@Injectable()
export class NeonAuthStrategy extends PassportStrategy(JwtStrategy, "neon-auth") {
  private readonly logger = new Logger(NeonAuthStrategy.name);

  constructor() {
    const projectId = process.env.STACK_PROJECT_ID;
    const jwksUrl = `https://api.stack-auth.com/api/v1/projects/${projectId}/.well-known/jwks.json`;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUrl,
      }),
      issuer: "https://api.stack-auth.com",
      algorithms: ["RS256"],
      ignoreExpiration: false,
    });
    this.logger.log(`NeonAuthStrategy configured with JWKS: ${jwksUrl}`);
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      clientMetadata: payload.clientMetadata || {},
      claims: payload,
    };
  }
}
