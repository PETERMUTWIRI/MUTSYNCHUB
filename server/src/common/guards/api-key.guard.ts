import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException, 
  Logger, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const requestId = request.headers['x-request-id'] || 'unknown';

    if (!apiKey) {
      this.logger.warn(`API key missing: requestId=${requestId}, ip=${request.ip}`);
      throw new UnauthorizedException('API key is required');
    }

    try {
      // Validate API key using Prisma directly
      const validatedKey = await this.prisma.apiKey.findUnique({
        where: { key: apiKey },
        include: { organization: true }
      });

      if (!validatedKey) {
        this.logger.warn(`Invalid API key: requestId=${requestId}, ip=${request.ip}`);
        throw new UnauthorizedException('Invalid API key');
      }

      if (validatedKey.status !== 'ACTIVE') {
        this.logger.warn(`Inactive API key: requestId=${requestId}, keyId=${validatedKey.id}`);
        throw new UnauthorizedException('API key is not active');
      }

      if (validatedKey.expiresAt && validatedKey.expiresAt < new Date()) {
        this.logger.warn(`Expired API key: requestId=${requestId}, keyId=${validatedKey.id}`);
        throw new UnauthorizedException('API key has expired');
      }

      // If there's a Stack Auth user in the request, validate organization match
      if (request.user?.orgId && validatedKey.orgId !== request.user.orgId) {
        this.logger.warn(
          `Organization mismatch: requestId=${requestId}, ` +
          `apiKeyOrg=${validatedKey.orgId}, userOrg=${request.user.orgId}`
        );
        throw new UnauthorizedException('API key does not belong to your organization');
      }

      // Attach API key info to request
      request.apiKey = {
        id: validatedKey.id,
        orgId: validatedKey.orgId,
        organization: validatedKey.organization,
        scopes: validatedKey.scopes
      };

      // Check required scopes
      const requiredScopes = this.getRequiredScopes(context);
      if (requiredScopes?.length > 0) {
        const hasScope = requiredScopes.every(scope => 
          validatedKey.scopes?.includes(scope)
        );
        if (!hasScope) {
          this.logger.warn(
            `Insufficient scope: requestId=${requestId}, ` +
            `required=${requiredScopes}, actual=${validatedKey.scopes}`
          );
          throw new ForbiddenException('Insufficient API key scope');
        }
      }

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: validatedKey.id },
        data: { lastUsedAt: new Date() }
      });

      // Audit log successful access
      this.logger.log(
        `API key access granted: requestId=${requestId}, ` +
        `org=${validatedKey.organization?.subdomain}, ` +
        `orgId=${validatedKey.orgId}, ` +
        `keyId=${validatedKey.id}, ` +
        `ip=${request.ip}`
      );

      return true;

    } catch (error) {
      // Log detailed error information
      this.logger.error(
        `API key validation failed: requestId=${requestId}, ` +
        `ip=${request.ip}, error=${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      // Rethrow authentication errors, wrap others
      if (error instanceof UnauthorizedException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('API key validation failed');
    }
  }

  private getRequiredScopes(context: ExecutionContext): string[] {
    return this.reflector.get<string[]>('scopes', context.getHandler()) || [];
  }
}
