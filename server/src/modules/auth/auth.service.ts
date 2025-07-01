import { Injectable, Logger } from '@nestjs/common';
import { EnterpriseAuthService } from './services/enterprise-auth.service';
import { RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PLANS } from '../../config/plans.config';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly enterpriseAuthService: EnterpriseAuthService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  async validateUser(email: string, password: string) {
    // Delegate to enterprise-grade service
    return this.enterpriseAuthService.validateUser(email, password);
  }

  async login(loginDto: { email: string; password: string; mfaToken?: string }) {
    // Validate user and handle MFA
    const user = await this.enterpriseAuthService.validateUser(loginDto.email, loginDto.password);
    return this.enterpriseAuthService.login(user, loginDto.mfaToken);
  }

  async register(registerDto: RegisterDto) {
    // Delegate registration to enterprise service
    return this.enterpriseAuthService.registerUserAndOrg(registerDto);
  }

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
