import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRedis } from '@nestjs/redis';
import Redis from 'ioredis';

@Injectable()
export class AnalyticsCacheService {
  private readonly logger = new Logger(AnalyticsCacheService.name);
  private readonly TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly auditLogger: any, // Inject AuditLoggerService
  ) {}

  async cacheAnalysisResult(key: string, result: any, userId?: string, orgId?: string): Promise<void> {
    try {
      const cacheKey = `analysis:${key}`;
      const meta = {
        cachedAt: new Date().toISOString(),
        userId,
        orgId,
        resultHash: this.hashResult(result),
      };
      await this.redis.setex(
        cacheKey,
        this.TTL,
        JSON.stringify({ result, meta })
      );
      this.logger.log(`Cached analysis result for key: ${key} (user: ${userId}, org: ${orgId})`);
      // Store an audit log entry
      await this.auditLogger.log({
        userId,
        orgId,
        action: 'CACHE_ANALYSIS_RESULT',
        resource: 'analytics_cache',
        details: { cacheKey, meta },
      });
    } catch (error) {
      this.logger.error(`Error caching analysis result: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      throw error;
    }
  }

  async getCachedAnalysis(key: string): Promise<any | null> {
    try {
      const cacheKey = `analysis:${key}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.logger.log(`Cache hit for key: ${key}`);
        return parsed;
      }
      this.logger.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving cached analysis: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      return null;
    }
  }

  async invalidateCache(key: string, userId?: string, orgId?: string): Promise<void> {
    try {
      const cacheKey = `analysis:${key}`;
      await this.redis.del(cacheKey);
      this.logger.log(`Invalidated cache for key: ${key} (user: ${userId}, org: ${orgId})`);
      // Store an audit log entry
      await this.auditLogger.log({
        userId,
        orgId,
        action: 'INVALIDATE_ANALYSIS_CACHE',
        resource: 'analytics_cache',
        details: { cacheKey },
      });
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      throw error;
    }
  }

  generateCacheKey(datasetId: string, analysisType: string, params: any): string {
    const paramHash = this.hashResult(params);
    return `${datasetId}:${analysisType}:${paramHash}`;
  }

  private hashResult(obj: any): string {
    // Simple hash for auditability (replace with a better hash if needed)
    const str = JSON.stringify(obj);
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }
}
