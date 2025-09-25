/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import CryptoJS from 'crypto-js';
import { revalidatePath } from 'next/cache';
import { DataGateway } from '@/lib/websocket';
import { getOrgProfileInternal } from '@/lib/org-profile'; // <-- NEW

/* ----------  encryption helpers  ---------- */
const ENCRYPTION_KEY =
  process.env.DATASOURCE_ENCRYPTION_KEY || 'fallback-32-char-key-must-be-32-chars';

function encrypt(obj: Record<string, any>): string {
  return CryptoJS.AES.encrypt(JSON.stringify(obj), ENCRYPTION_KEY).toString();
}

/* ----------  POST /api/data-source  ---------- */
export async function POST(req: NextRequest) {
  try {
    /* 1.  grab user/org without HTTP round-trip ---------------------- */
    const { orgId, email } = await getOrgProfileInternal(
      req.headers );
    /* ---------------------------------------------------------------- */

    /* 2.  validate body ---------------------------------------------- */
    const body = await req.json();
    const { type, name, config } = body;
    if (!type || !name || !config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
    }

    /* 3.  pre-flight checks ... (rest of file untouched) ------------- */

  } catch (e: any) {
    console.error('[data-source]', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}