/* eslint-disable @typescript-eslint/no-explicit-any */
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { Headers } from 'undici-types'; // only for type

/* ------------------------------------------------------------------ */
export async function getOrgProfileInternal(headers: Headers) {
  /* 1.  build a minimal token-store that reads the cookie header ----- */
  const cookieHeader = headers.get('cookie') || '';
  const tokenStore = {
    get: async () => cookieHeader,
    set: async () => {}, // read-only
    delete: async () => {},
  };
  /* ------------------------------------------------------------------ */

  const user = await stackServerApp.getUser({
    or: 'throw',
    tokenStore,
  });

  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!profile) {
    let org = await prisma.organization.findFirst({});
    if (!org) {
      org = await prisma.organization.create({
        data: {
          id: uuidv4(),
          name: `Org-${user.id.slice(0, 8)}`,
          subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          planId: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
        },
      });
    }
    profile = await prisma.userProfile.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        orgId: org.id,
        role: 'USER',
        email: user.primaryEmail,
        firstName: user.displayName?.split(' ')[0] ?? null,
        lastName: user.displayName?.split(' ').slice(1).join(' ') ?? null,
        isTechnical: false,
        layoutMode: 'beginner',
        dashboardLayout: Prisma.DbNull,
      },
      include: { organization: true },
    });
  }

  const planId = profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723';
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

 return {
  userId: user.id, // <-- NEW
  orgId: profile.orgId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  role: profile.role,
  isTechnical: profile.isTechnical,
  layoutMode: profile.layoutMode,
  dashboardLayout: profile.dashboardLayout,
  plan,
  flags: {},
};
}