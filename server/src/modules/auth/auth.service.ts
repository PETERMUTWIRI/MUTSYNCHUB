import { Injectable, Logger } from '@nestjs/common';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { PLANS } from '../../config/plans.config';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class AuthService {
  // signJwt removed. No backend JWT signing; Supabase JWT only.
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly enterpriseAuthService: EnterpriseAuthService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  // All legacy authentication methods removed. Use Supabase Auth only.

  async getUsageAndPlan(userId: string) {
    // Get user and org
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');
    const org = await this.organizationService.findById(user.orgId);
    if (!org) throw new Error('Organization not found');
    // Find plan config
    const plan = PLANS.find(p => p.id === org.planId || p.name === org.planId);
    // Example usage: count agent queries, scheduled reports, etc. (stubbed here)
    // You can replace with real usage queries as needed
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

  async getPlans() {
    return PLANS;
  }
}
