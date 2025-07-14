import { Controller, Get, Put, Param, Body, UseGuards,Delete,Post,Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- User Management ---
  @Get('users')
  @Roles('ADMIN')
  async listUsers() { return this.adminService.getAllUsers(); }

  @Get('users/:id')
  @Roles('ADMIN')
  async getUser(@Param('id') id: string) { return this.adminService.getUserById(id); }

  @Post('users')
  @Roles('ADMIN')
  async createUser(@Body() body: any) { return this.adminService.createUser(body); }

  @Put('users/:id')
  @Roles('ADMIN')
  async updateUser(@Param('id') id: string, @Body() body: any) { return this.adminService.updateUser(id, body); }

  @Delete('users/:id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(id); }

  @Put('users/:id/role')
  @Roles('ADMIN')
  async assignRole(@Param('id') id: string, @Body('role') role: string) { 
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new Error('Invalid role');
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
  async createOrg(@Body() body: any) { return this.adminService.createOrganization(body); }

  @Put('orgs/:id')
  @Roles('ADMIN')
  async updateOrg(@Param('id') id: string, @Body() body: any) { return this.adminService.updateOrganization(id, body); }

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
  async getAuditLogs(@Query() query: any) { return this.adminService.getAuditLogs(query); }

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
}
