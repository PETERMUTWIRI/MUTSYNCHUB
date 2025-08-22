import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export type EnrichedUserProfile = {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaPendingSecret: string | null;
  mfaBackupCodes: string | null;
  failedLoginAttempts: number;
  refreshTokenHash: string | null;
  resetTokenHash: string | null;
  resetTokenExpiresAt: Date | null;
  featureFlags: any | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  auth_user_id: string;
  auth_user_name: string | null;
  auth_user_email: string | null;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getEnrichedUserProfile(userId: string): Promise<EnrichedUserProfile | null> {
    const result = await this.prisma.$queryRaw`
      SELECT 
        up.*,
        us.id as auth_user_id,
        us.name as auth_user_name,
        us.email as auth_user_email
      FROM 
        "public"."UserProfile" up
      LEFT JOIN 
        neon_auth.users_sync us ON up."userId" = us.id
      WHERE 
        up."userId" = ${userId}
        AND us.deleted_at IS NULL
    `;
    return result?.[0] || null;
  }

  async getEnrichedUserProfiles(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserProfileWhereInput;
    orderBy?: Prisma.UserProfileOrderByWithRelationInput;
  }): Promise<EnrichedUserProfile[]> {
    const { skip, take, where, orderBy } = params || {};
    let whereClause = 'WHERE us.deleted_at IS NULL';
    if (where?.orgId) {
      whereClause += ` AND up."orgId" = '${where.orgId}'`;
    }
    if (where?.status) {
      whereClause += ` AND up.status = '${where.status}'`;
    }

    let orderByClause = 'ORDER BY up."createdAt" DESC';
    if (orderBy) {
      const field = Object.keys(orderBy)[0];
      const direction = orderBy[field] === 'desc' ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY up."${field}" ${direction}`;
    }

    let limitOffset = '';
    if (take !== undefined) {
      limitOffset = `LIMIT ${take}`;
      if (skip !== undefined) {
        limitOffset += ` OFFSET ${skip}`;
      }
    }

    const result = await this.prisma.$queryRaw`
      SELECT 
        up.*,
        us.id as auth_user_id,
        us.name as auth_user_name,
        us.email as auth_user_email
      FROM 
        "public"."UserProfile" up
      LEFT JOIN 
        neon_auth.users_sync us ON up."userId" = us.id
      ${Prisma.raw(whereClause)}
      ${Prisma.raw(orderByClause)}
      ${Prisma.raw(limitOffset)}
    `;

    return result as EnrichedUserProfile[];
  }

  async createUserProfile(userId: string, data: Prisma.UserProfileCreateInput) {
    const authUser = await this.prisma.$queryRaw`
      SELECT id, email FROM neon_auth.users_sync 
      WHERE id = ${userId} AND deleted_at IS NULL
    `;

    if (!authUser?.[0]) {
      throw new Error('User not found in auth system');
    }

    return this.prisma.userProfile.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async updateUserProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return this.prisma.userProfile.update({
      where: { userId },
      data
    });
  }

  async getUserWithOrganization(userId: string) {
    const result = await this.prisma.$queryRaw`
      SELECT 
        up.*,
        us.id as auth_user_id,
        us.name as auth_user_name,
        us.email as auth_user_email,
        org.name as org_name,
        org.subdomain as org_subdomain
      FROM 
        "public"."UserProfile" up
      LEFT JOIN 
        neon_auth.users_sync us ON up."userId" = us.id
      LEFT JOIN
        "public"."Organization" org ON up."orgId" = org.id
      WHERE 
        up."userId" = ${userId}
        AND us.deleted_at IS NULL
    `;
    return result?.[0] || null;
  }
}