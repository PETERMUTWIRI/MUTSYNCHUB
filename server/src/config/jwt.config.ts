import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Default to 1 day
  refreshExpiresIn: '7d' // Fixed value for refresh tokens
}));
