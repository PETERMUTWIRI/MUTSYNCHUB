import { NextRequest, NextResponse } from 'next/server';
import { createDataSourceServer } from '@/lib/server/dataSourceServer';
import { getOrgProfileInternal } from '@/lib/org-profile';

const ANALYTICS_URL = process.env.ANALYTICS_INTERNAL_URL || 'http://analytics:8000';

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);
    const body = await req.json();
    const { type, name, config } = body;
    if (!type || !name || !config) return NextResponse.json({ error: 'Bad payload' }, { status: 400 });

    const ds = await createDataSourceServer(orgId, type, name, config);

    // Forward to analytics container – **all 4 query params required**
    const url = `${ANALYTICS_URL}/api/v1/datasources?orgId=${orgId}&sourceId=${ds.id}&type=${type}`;
    console.log('[data-source] calling:', url); // ← log to confirm

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANALYTICS_API_KEY! },
      body: JSON.stringify({ config }), // ← pass config in the body
    });

    if (!res.ok) throw new Error(`Analytics sync failed: ${res.status} ${await res.text()}`);

    return NextResponse.json({ id: ds.id });
  } catch (e: any) {
    console.error('[data-source]', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}