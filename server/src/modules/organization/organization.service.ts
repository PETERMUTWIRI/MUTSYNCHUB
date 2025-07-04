import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { OrgStatus } from '@prisma/client';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(data: {
    name: string;
    subdomain: string;
    settings?: Record<string, any>;
  }) {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingOrg) {
      throw new ConflictException('Subdomain already exists');
    }

    return this.prisma.organization.create({
      data: {
        ...data,
        status: OrgStatus.ACTIVE,
      },
    });
  }

  async findById(id?: string) {
    // If no id provided, use tenant context
    const orgId = id || this.tenantContext.getTenantId();
    if (!orgId) throw new NotFoundException('Organization not found');
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: true,
        dataSources: true,
        subscription: true,
      },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findBySubdomain(subdomain: string) {
    const org = await this.prisma.organization.findUnique({
      where: { subdomain },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(id: string, data: {
    name?: string;
    settings?: Record<string, any>;
    status?: OrgStatus;
  }) {
    // Use tenant context to ensure update is scoped to current tenant
    const orgId = id || this.tenantContext.getTenantId();
    const org = await this.findById(orgId);
    return this.prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async delete(id: string) {
    // Use tenant context to ensure delete is scoped to current tenant
    const orgId = id || this.tenantContext.getTenantId();
    const org = await this.findById(orgId);
    return this.prisma.organization.delete({
      where: { id: orgId },
    });
  }
}
