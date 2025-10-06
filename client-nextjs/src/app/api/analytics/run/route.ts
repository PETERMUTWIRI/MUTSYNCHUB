import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL!;
const ANALYTICS_KEY = process.env.ANALYTICS_KEY ?? 'dev-analytics-key-123';

export async function POST(req: NextRequest) {
  try {
    /* 1. auth (same as data-source) ------------------------------------ */
    const { orgId } = await getOrgProfileInternal(req.headers);

    /* 2. forward to Python container ---------------------------------- */
    const body = await req.json();
    const dataPath = `/data/${orgId}/sales.parquet`;
    const res = await fetch(`${ANALYTICS_URL}/api/analytics/run`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-api-key': ANALYTICS_KEY,
        },
      body: JSON.stringify({ ...body, orgId }), // orgId inside JSON
   });

    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: msg }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch (e: any) {
    console.error('[analytics-run]', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}