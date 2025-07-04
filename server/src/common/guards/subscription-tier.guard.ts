import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { TenantContextService } from '../services/tenant-context.service';
import { PLANS } from '../../config/plans.config';

export const SUBSCRIPTION_TIER_KEY = 'subscriptionTier';
export type SubscriptionTier = typeof PLANS[number]['id'];

export function RequiredSubscriptionTier(tier: SubscriptionTier): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(SUBSCRIPTION_TIER_KEY, tier, descriptor.value!);
    return descriptor;
  };
}

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<SubscriptionTier>(SUBSCRIPTION_TIER_KEY, context.getHandler());
    if (!requiredTier) return true; // No tier required

    // Use TenantContextService to get tenant/org ID
    const orgId = this.tenantContext.getTenantId();
    if (!orgId) throw new ForbiddenException('Tenant/Organization not found');

    // Fetch org from DB
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new ForbiddenException('Organization not found');

    // Use plan IDs from PLANS config for order
    const planOrder = PLANS.map(plan => plan.id);
    const orgTierIdx = planOrder.indexOf(org.planId);
    const requiredTierIdx = planOrder.indexOf(requiredTier);
    if (orgTierIdx < 0 || requiredTierIdx < 0) {
      throw new ForbiddenException('Invalid subscription tier');
    }
    if (orgTierIdx < requiredTierIdx) {
      throw new ForbiddenException(`Upgrade to ${requiredTier} to access this feature.`);
    }
    return true;
  }
}
