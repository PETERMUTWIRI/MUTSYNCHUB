/* src/lib/org-profile.ts */
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';

export async function getOrgProfileInternal() {
  /* 1.  only use StackFrame to get the user id (server-side cookie) */
  const user = await stackServerApp.getUser({ or: 'throw' });

  /* 2.  everything else lives in our tables */
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!profile) throw new Error('Profile not found');

  const planId = profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723';
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  return {
    userId: user.id,
    orgId: profile.orgId,
    email: profile.email,
    role: profile.role,
    plan,
  };
}