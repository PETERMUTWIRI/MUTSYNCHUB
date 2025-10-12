/* src/lib/org-profile.ts – client-safe */
import { getRawOrgProfile } from './server/orgProfileServer';
import { stackServerApp } from '@/lib/stack';
import { NextRequest } from 'next/server';

export async function getOrgProfileInternal(req: NextRequest) {
  const user = await stackServerApp.getUser({ or: 'throw' });
  const raw = await getRawOrgProfile(user.id); // ← server-only
  return {
    userId: user.id,
    orgId: raw.orgId,
    role: raw.role,
  };
}