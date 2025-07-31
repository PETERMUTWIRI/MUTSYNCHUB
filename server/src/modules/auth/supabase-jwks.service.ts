import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SupabaseJwksService {
  private readonly logger = new Logger(SupabaseJwksService.name);
  private jwksCache: any = null;
  private lastFetch = 0;
  private readonly cacheTtl = 60 * 60 * 1000; // 1 hour

  async getJwks(supabaseUrl: string): Promise<any> {
    const now = Date.now();
    if (this.jwksCache && now - this.lastFetch < this.cacheTtl) {
      return this.jwksCache;
    }
    const jwksUrl = `${supabaseUrl}/auth/v1/keys`;
    try {
      const res = await axios.get(jwksUrl);
      this.jwksCache = res.data;
      this.lastFetch = now;
      return this.jwksCache;
    } catch (err) {
      this.logger.error(`Failed to fetch JWKS from ${jwksUrl}:`, err);
      throw err;
    }
  }
}
