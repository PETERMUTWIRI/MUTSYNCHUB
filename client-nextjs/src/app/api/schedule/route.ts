import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL!;

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error('Profile not found');

    /*  call Docker analytics service  */
    const res = await fetch(`${ANALYTICS_URL}/schedules?orgId=${profile.orgId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Analytics service: ${res.statusText}`);

    const schedules = await res.json(); // { schedules: [{ id, frequency, nextRun }] }
    return NextResponse.json(schedules);
  } catch (e: any) {
    console.error('[api/analytics/schedule]', e);
    return NextResponse.json({ schedules: [] }, { status: 500 });
  }
}