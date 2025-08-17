import { Injectable } from '@nestjs/common';
import { PLANS } from '../../config/plans.config';
import { UserService } from '../users/user.service';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class StackAuthBusinessService {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  async getUsageAndPlan(userId: string) {
  const user = await this.userService.getEnrichedUserProfile(userId);
    if (!user) throw new Error('User not found');
    const org = await this.organizationService.findById(user.orgId);
    if (!org) throw new Error('Organization not found');
    const plan = PLANS.find(p => p.id === org.planId || p.name === org.planId);
    // Example usage: count agent queries, scheduled reports, etc. (stubbed here)
    const usage = {
      agentQueries: 0, // TODO: query actual usage
      scheduledReports: 0, // TODO: query actual usage
    };
    return {
      plan: plan || null,
      usage,
      org: { id: org.id, name: org.name, subdomain: org.subdomain },
    };
  }

  getPlans() {
    return PLANS;
  }
}
