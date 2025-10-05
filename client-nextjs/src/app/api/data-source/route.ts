/* src/app/api/data-source/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import CryptoJS from 'crypto-js';
import { DataGateway } from '@/lib/websocket';
import { getOrgProfileInternal } from '@/lib/org-profile';

const ENC_KEY = process.env.DATASOURCE_ENCRYPTION_KEY!;
if (!ENC_KEY || ENC_KEY.length !== 32)
  throw new Error('DATASOURCE_ENCRYPTION_KEY must be 32 chars');

const ANALYTICS_URL = process.env.ANALYTICS_INTERNAL_URL || 'http://analytics:8000';

/* ---------- utils ---------- */
const encrypt = (o: any) =>
  CryptoJS.AES.encrypt(JSON.stringify(o), ENC_KEY).toString();

/* ---------- POST ---------- */
export async function POST(req: NextRequest) {
  try {
    /* 1. auth ------------------------------------------------------ */
    const { orgId } = await getOrgProfileInternal(req.headers); 

    /* 2. parse body ----------------------------------------------- */
    const body = await req.json();
    const { type, name, config } = body; // config = {host,port,token,url,etc}
    if (!type || !name || !config || typeof config !== 'object')
      return NextResponse.json({ error: 'Bad payload' }, { status: 400 });

    /* 3. save encrypted record ------------------------------------ */
    const datasource = await prisma.dataSource.create({
      data: {
        orgId,
        type,
        name,
        config: encrypt(config),
      },
    });

    /* 4. tell Python service to start first sync ------------------ */
    const API_KEY = process.env.ANALYTICS_API_KEY!;
    const pyRes = await fetch(`${ANALYTICS_URL}/api/v1/datasources`, {
      method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-api-key': API_KEY,
       },
      body: JSON.stringify({
        orgId,
        sourceId: datasource.id,
        type,
        config,
      }),
    });
    if (!pyRes.ok) {
      const msg = await pyRes.text();
      throw new Error(`Analytics sync failed: ${pyRes.status} ${msg}`);
    }

    /* 5. websocket push ------------------------------------------ */
    if (typeof window !== 'undefined') {
      DataGateway.broadcastToOrg(orgId, 'datasource_created', { id: datasource.id, name, type });
    }

    /* 6. done ----------------------------------------------------- */
    return NextResponse.json({ id: datasource.id });
  } catch (e: any) {
    console.error('[data-source]', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}