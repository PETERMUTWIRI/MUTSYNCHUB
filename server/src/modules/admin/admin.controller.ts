
import { Controller, Get, Put, Param, Body, UseGuards, Delete, Post, Query, Req, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryDto } from './dto/query.dto';

@Controller('admin')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class AdminController {
  // --- Per-User Feature Flags ---
  @Get('users/:id/feature-flags')
  @Roles('ADMIN')
  async getUserFeatureFlags(@Param('id') id: string) {
    return this.adminService.getUserFeatureFlags(id);
  }

  @Put('users/:id/feature-flags')
  @Roles('ADMIN')
  async setUserFeatureFlags(@Param('id') id: string, @Body('flags') flags: Record<string, any>) {
    return this.adminService.setUserFeatureFlags(id, flags);
  }
  // --- Feature Flags (Global) ---
  @Get('feature-flags')
  @Roles('ADMIN')
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  constructor(
    private readonly adminService: AdminService,
    private readonly tenantContext: TenantContextService
  ) {}

  @Put('feature-flags/:key')
  @Roles('ADMIN')
  async updateFeatureFlag(@Param('key') key: string, @Body('value') value: any) {
    return this.adminService.updateFeatureFlag(key, value);
  }

  // --- User Management ---
  @Get('users')
  @Roles('ADMIN')
  async listUsers() { return this.adminService.getAllUsers(); }

  @Get('users/:id')
  @Roles('ADMIN')
  async getUser(@Param('id') id: string) { return this.adminService.getUserById(id); }

  @Post('users')
  @Roles('ADMIN')
  async createUser(@Body() createUserDto: CreateUserDto) { return this.adminService.createUser(createUserDto); }

  @Put('users/:id')
  @Roles('ADMIN')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) { return this.adminService.updateUser(id, updateUserDto); }

  @Delete('users/:id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(id); }

  @Put('users/:id/role')
  @Roles('ADMIN')
  async assignRole(@Param('id') id: string, @Body('role') role: string) { 
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
    }
    return this.adminService.setUserRole(id, role as UserRole); 
  }

  @Put('users/:id/tenant')
  @Roles('ADMIN')
  async assignTenant(@Param('id') id: string, @Body('tenantId') tenantId: string) { return this.adminService.setUserTenant(id, tenantId); }

  // --- Organization/Tenant Management ---
  @Get('orgs')
  @Roles('ADMIN')
  async listOrgs() { return this.adminService.getAllOrganizations(); }

  @Get('orgs/:id')
  @Roles('ADMIN')
  async getOrg(@Param('id') id: string) { return this.adminService.getOrganizationById(id); }

  @Post('orgs')
  @Roles('ADMIN')
  async createOrg(@Body() createOrganizationDto: CreateOrganizationDto) { return this.adminService.createOrganization(createOrganizationDto); }

  @Put('orgs/:id')
  @Roles('ADMIN')
  async updateOrg(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) { return this.adminService.updateOrganization(id, updateOrganizationDto); }

  @Delete('orgs/:id')
  @Roles('ADMIN')
  async deleteOrg(@Param('id') id: string) { return this.adminService.deleteOrganization(id); }

  // --- Analytics & Usage ---
  @Get('analytics')
  @Roles('ADMIN')
  async getAnalytics(@Query() query: any) { return this.adminService.getAnalytics(query); }

  @Get('analytics/export')
  @Roles('ADMIN')
  async exportAnalytics(@Query() query: any) { return this.adminService.exportAnalytics(query); }

  // --- Audit Logs ---
  @Get('audit-logs')
  @Roles('ADMIN')
  async getAuditLogs(@Query() queryDto: QueryDto) { return this.adminService.getAuditLogs(queryDto); }

  // --- Revenue & Billing ---
  @Get('revenue')
  @Roles('ADMIN')
  async getRevenue(@Query() query: any) { return this.adminService.getRevenue(query); }

  @Get('invoices')
  @Roles('ADMIN')
  async getInvoices(@Query() query: any) { return this.adminService.getInvoices(query); }

  @Put('plans/:id')
  @Roles('ADMIN')
  async updatePlan(@Param('id') id: string, @Body() body: any) { return this.adminService.updatePlan(id, body); }

  // --- Settings & Configuration ---
  @Get('settings')
  @Roles('ADMIN')
  async getSettings() { return this.adminService.getSettings(); }

  @Put('settings')
  @Roles('ADMIN')
  async updateSettings(@Body() body: any) { return this.adminService.updateSettings(body); }

  // --- Support & Notifications ---
  @Get('support-tickets')
  @Roles('ADMIN')
  async getSupportTickets(@Query() query: any) { return this.adminService.getSupportTickets(query); }

  @Post('support-tickets/:id/respond')
  @Roles('ADMIN')
  async respondToTicket(@Param('id') id: string, @Body('response') response: string) { return this.adminService.respondToTicket(id, response); }

  @Post('notifications')
  @Roles('ADMIN')
  async sendNotification(@Body() body: any) { return this.adminService.sendNotification(body); }

    // --- Analytics Chart/Trend Endpoints ---
  @Get('stats/user-growth/:orgId')
  @Roles('ADMIN')
  async getUserGrowth(@Param('orgId') orgId: string) {
    return this.adminService.getUserGrowth(orgId);
  }

  @Get('stats/revenue-trend/:orgId')
  @Roles('ADMIN')
  async getRevenueTrend(@Param('orgId') orgId: string) {
    return this.adminService.getRevenueTrend(orgId);
  }

  @Get('stats/active-users-trend/:orgId')
  @Roles('ADMIN')
  async getActiveUsersTrend(@Param('orgId') orgId: string) {
    return this.adminService.getActiveUsersTrend(orgId);
  }

  @Get('stats/churn-trend/:orgId')
  @Roles('ADMIN')
  async getChurnTrend(@Param('orgId') orgId: string) {
    return this.adminService.getChurnTrend(orgId);
  }

}
