import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { Organization, User, UserRole } from '@prisma/client';
import { AuditLoggerService } from '../../common/services/audit-logger.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  // --- User Management ---
  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Admin creating user: ${createUserDto.email}`);
    const { email, password, firstName, lastName, orgId } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Attempted to create user with existing email: ${email}`);
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        orgId,
      },
    });

    // Audit log user creation
    await this.auditLogger.log({
      userId: 'admin',
      action: 'admin_create_user',
      resource: 'user',
      details: {
        targetUserId: user.id,
        email: user.email,
      },
     });

    this.logger.log(`Admin successfully created user: ${user.email}`);
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Admin updating user: ${id}`);
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    await this.auditLogger.log({
      userId: 'admin', // Or get the admin user ID from the request context
      action: 'admin_update_user',
      resource: 'user',
      details: {
        targetUserId: id,
        updatedData: updateUserDto,
      },
    });

    this.logger.log(`Admin successfully updated user: ${id}`);
    return user;
  }

  async deleteUser(id: string): Promise<User> {
    this.logger.log(`Admin deleting user: ${id}`);
    const user = await this.prisma.user.delete({ where: { id } });

    await this.auditLogger.log({
      userId: 'admin', // Or get the admin user ID from the request context
      action: 'admin_delete_user',
      resource: 'user',
      details: {
        targetUserId: id,
      },
    });

    this.logger.log(`Admin successfully deleted user: ${id}`);
    return user;
  }

  async setUserTenant(id: string, tenantId: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { orgId: tenantId },
    });

    await this.auditLogger.log({
      userId: 'admin', // Or get the admin user ID from the request context
      action: 'admin_set_user_tenant',
      resource: 'user',
      details: {
        targetUserId: id,
        tenantId,
      },
    });

    return user;
  }

  // --- Organization/Tenant Management ---
  async getOrganizationById(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async createOrganization(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    this.logger.log(`Admin creating organization: ${createOrganizationDto.name}`);
    const organization = await this.prisma.organization.create({
      data: createOrganizationDto,
    });

    await this.auditLogger.log({
      userId: 'admin',
      action: 'admin_create_organization',
      resource: 'organization',
      details: {
        organizationId: organization.id,
        name: organization.name,
      },
    });

    this.logger.log(`Admin successfully created organization: ${organization.name}`);
    return organization;
  }

  async updateOrganization(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    this.logger.log(`Admin updating organization: ${id}`);
    const organization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });

    await this.auditLogger.log({
      userId: 'admin',
      action: 'admin_update_organization',
      resource: 'organization',
      details: {
        organizationId: id,
        updatedData: updateOrganizationDto,
      },
    });

    this.logger.log(`Admin successfully updated organization: ${id}`);
    return organization;
  }

  async deleteOrganization(id: string): Promise<Organization> {
    this.logger.log(`Admin deleting organization: ${id}`);
    // TODO: check for dependencies
    const organization = await this.prisma.organization.delete({ where: { id } });

    await this.auditLogger.log({
      userId: 'admin',
      action: 'admin_delete_organization',
      resource: 'organization',
      details: {
        organizationId: id,
      },
    });

    this.logger.log(`Admin successfully deleted organization: ${id}`);
    return organization;
  }

  // --- Analytics & Usage ---
  async getAnalytics(query: any): Promise<any> {
    // TODO: Aggregate analytics from multiple tables, filter by date/org/user
    const users = await this.prisma.user.count();
    const orgs = await this.prisma.organization.count();
    return { users, orgs };
  }

  async exportAnalytics(query: any) {
    // TODO: Generate CSV/Excel export, filter by query
    return { exportUrl: '/exports/analytics.csv' };
  }

  // --- Audit Logs ---
  async getAuditLogs(queryDto: QueryDto): Promise<any> {
    const { page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
    };
  }

  // --- Revenue & Billing ---
  async getRevenue(query: any) {
    // TODO: Aggregate revenue, filter by org/date
    return { total: 0, byOrg: [] };
  }

  async getInvoices(query: any) {
    // TODO: Fetch invoices from billing system
    return [];
  }

  async updatePlan(id: string, body: any) {
    // TODO: Validate plan, audit logging
    return this.prisma.plan.update({ where: { id }, data: body });
  }

  // --- Settings & Configuration ---
  async getSettings() {
    // TODO: Fetch global platform settings
    return this.prisma.settings.findMany();
  }

  async updateSettings(body: any) {
    // TODO: Validate and update settings
    return this.prisma.settings.updateMany({ data: body });
  }

  // --- Support & Notifications ---
  async getSupportTickets(query: any) {
    // TODO: Filter tickets by status/org/user
    return this.prisma.supportTicket.findMany({ where: { ...query } });
  }

  async respondToTicket(id: string, response: string) {
    // TODO: Add response, notify user
    return this.prisma.supportTicket.update({ where: { id }, data: { response } });
  }

  async sendNotification(body: any) {
    // TODO: Integrate with notification service/provider
    return { success: true };
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async setUserRole(userId: string, role: UserRole, context?: { adminId?: string; orgId?: string; ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    // Audit log role change
    await this.auditLogger.log({
      userId: context?.adminId || 'admin',
      orgId: context?.orgId,
      action: 'admin_set_user_role',
      resource: 'user',
      details: {
        targetUserId: userId,
        newRole: role,
      },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
    return updated;
  }

  async getAllOrganizations() {
    return this.prisma.organization.findMany();
  }

  async setOrganizationStatus(orgId: string, status: string, context?: { adminId?: string; ipAddress?: string; userAgent?: string }) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: { status: status as any }, // Cast to any to allow string, or use $Enums.OrgStatus
    });
    // Audit log org status change
    await this.auditLogger.log({
      userId: context?.adminId || 'admin',
      orgId,
      action: 'admin_set_org_status',
      resource: 'organization',
      details: {
        newStatus: status,
      },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
    return updated;
  }
}
