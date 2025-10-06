import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL!;
const ANALYTICS_KEY = process.env.ANALYTICS_KEY ?? 'dev-analytics-key-123';

/* ------------------ GET /api/analytics/schedules?orgId=xxx ------------------ */
export async function GET(req: NextRequest) {
  try {
    const { orgId }   = await getOrgProfileInternal(req.headers);
    const res = await fetch(`${ANALYTICS_URL}/schedules?orgId=${orgId}`, {
      headers: { 'x-api-key': ANALYTICS_KEY },
    });
    if (!res.ok) throw new Error('Scheduler unreachable');
    return NextResponse.json(await res.json());
  } catch (e: any) {
    console.error('[analytics-schedules GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ------------------ POST /api/analytics/schedules --------------------------- */
export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req.headers);
    const body      = await req.json();
    const res = await fetch(`${ANALYTICS_URL}/schedules`, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key'   : ANALYTICS_KEY,
      },
      body: JSON.stringify({ ...body, orgId }),
    });
    if (!res.ok) throw new Error('Scheduler error');
    return NextResponse.json(await res.json());
  } catch (e: any) {
    console.error('[analytics-schedules POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}