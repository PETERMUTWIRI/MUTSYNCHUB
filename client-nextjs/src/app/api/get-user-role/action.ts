'use server';

import { PrismaClient } from '@prisma/client';
import { stackServerApp } from '@/stack';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';

const prisma = new PrismaClient();
const sql = neon(process.env.DATABASE_URL!);

export async function ensureAndFetchUserProfile() {
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });

  // Use StackAuth user.id as userId
  const userId = user.id;

  // Create minimal JWT payload for RLS
  const jwtPayload = { user_id: userId };

  // Set JWT for RLS
  await sql`SELECT set_config('session.jwt', ${JSON.stringify(jwtPayload)}, true)`;

  let profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { role: true, orgId: true },
  });

  if (!profile) {
    // Try to find an existing organization
    let org = await prisma.organization.findFirst({
      select: { id: true },
    });

    if (!org) {
      // Create a new organization if none exists
      const orgId = uuidv4();
      await prisma.organization.create({
        data: {
          id: orgId,
          name: `Org-${userId.slice(0, 8)}`,
          subdomain: `org-${userId.slice(0, 8)}-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      org = { id: orgId };
    }

    profile = await prisma.userProfile.create({
      data: {
        id: uuidv4(),
        userId,
        orgId: org.id,
        role: 'USER',
        status: 'ACTIVE',
        mfaEnabled: false,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: { role: true, orgId: true },
    });
  }

  return {
    role: profile.role || 'USER',
    orgId: profile.orgId,
  };
}