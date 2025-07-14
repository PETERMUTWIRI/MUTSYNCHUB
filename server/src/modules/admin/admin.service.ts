import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { AuditLoggerService } from '../../common/services/audit-logger.service';

@Injectable()
export class AdminService {
  // --- User Management ---
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(body: any) {
    // Validate input, hash password, assign default role/org, etc.
    // TODO: Add validation and security checks
    return this.prisma.user.create({ data: body });
  }

  async updateUser(id: string, body: any) {
    // TODO: Add validation, audit logging
    return this.prisma.user.update({ where: { id }, data: body });
  }

  async deleteUser(id: string) {
    // TODO: Add audit logging, check for dependencies
    return this.prisma.user.delete({ where: { id } });
  }

  async setUserTenant(id: string, tenantId: string) {
    // TODO: Validate tenantId, audit logging
    return this.prisma.user.update({ where: { id }, data: { orgId: tenantId } });
  }

  // --- Organization/Tenant Management ---
  async getOrganizationById(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async createOrganization(body: any) {
    // TODO: Validate input, audit logging
    return this.prisma.organization.create({ data: body });
  }

  async updateOrganization(id: string, body: any) {
    // TODO: Validate input, audit logging
    return this.prisma.organization.update({ where: { id }, data: body });
  }

  async deleteOrganization(id: string) {
    // TODO: Audit logging, check for dependencies
    return this.prisma.organization.delete({ where: { id } });
  }

  // --- Analytics & Usage ---
  async getAnalytics(query: any) {
    // TODO: Aggregate analytics from multiple tables, filter by date/org/user
    return { users: await this.prisma.user.count(), orgs: await this.prisma.organization.count() };
  }

  async exportAnalytics(query: any) {
    // TODO: Generate CSV/Excel export, filter by query
    return { exportUrl: '/exports/analytics.csv' };
  }

  // --- Audit Logs ---
  async getAuditLogs(query: any) {
    // TODO: Filter logs by user, action, date
    return this.prisma.auditLog.findMany({ where: { ...query } });
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
