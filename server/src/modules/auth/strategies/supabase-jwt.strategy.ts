import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseJwksService } from '../supabase-jwks.service';
// import * as jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  private readonly logger = new Logger(SupabaseJwtStrategy.name);

  constructor(private readonly supabaseJwksService: SupabaseJwksService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          if (!supabaseUrl) {
            return done(new Error('Supabase URL is not set in environment variables'), null);
          }
          const jwks = await this.supabaseJwksService.getJwks(supabaseUrl);
          const decoded: any = jwt.decode(rawJwtToken, { complete: true });
          if (!decoded || !decoded.header) {
            return done(new Error('Invalid JWT: cannot decode header'), null);
          }
          const kid = decoded.header.kid;
          const key = jwks.keys.find((k) => k.kid === kid);
          if (!key) {
            return done(new Error('JWKS key not found'), null);
          }
          let pubKey: string;
          if (key.kty === 'EC') {
            // ES256: build PEM from x, y, crv
            pubKey = ecJwkToPem(key);
          } else if (key.kty === 'RSA' && key.x5c && key.x5c[0]) {
            pubKey = certToPEM(key.x5c[0]);
          } else {
            return done(new Error('Unsupported key type or missing key data'), null);
          }
          done(null, pubKey);

// Helper to convert EC JWK to PEM (ES256)
function ecJwkToPem(jwk: any): string {
  const { x, y, crv } = jwk;
  if (!x || !y || !crv) throw new Error('Invalid EC JWK');
  const Buffer = require('buffer').Buffer;
  const pub = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(x, 'base64'),
    Buffer.from(y, 'base64'),
  ]);
  // ASN.1 DER encoding for EC public key (NIST P-256)
  const pubKeyInfo = Buffer.from(
    '3059301306072a8648ce3d020106082a8648ce3d030107034200',
    'hex'
  );
  const der = Buffer.concat([pubKeyInfo, pub]);
  const b64 = der.toString('base64');
  const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----\n`;
  return pem;
}
// Helper to convert x5c cert to PEM format
function certToPEM(cert: string): string {
  let pem = cert.match(/.{1,64}/g)?.join('\n') ?? cert;
  pem = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`;
  return pem;
}
        } catch (err) {
          done(err, null);
        }
      },
      algorithms: ['ES256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // Attach sub and email to request user
    return { sub: payload.sub, email: payload.email };
  }
}
