import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

async function proxyRequest(req: NextRequest) {
  const urlPath = req.nextUrl.pathname.replace(/^\/api\/proxy/, '');
  const target = `${BACKEND_BASE_URL}${urlPath}${req.nextUrl.search || ''}`;

  // Prefer Authorization header from client; fallback to cookie named 'neon-auth-token'
  const clientAuth = req.headers.get('authorization');
  const cookieToken = req.cookies.get('neon-auth-token')?.value;
  const authorization = clientAuth ?? (cookieToken ? `Bearer ${cookieToken}` : null);

  // Copy headers excluding hop-by-hop and host
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (HOP_BY_HOP.has(key) || key === 'host') return;
    headers[key] = v;
  });
  if (authorization) headers['authorization'] = authorization;

  const bodyBuf = await req.arrayBuffer();
  const body = bodyBuf.byteLength ? Buffer.from(bodyBuf) : undefined;

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
  });

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    if (HOP_BY_HOP.has(k.toLowerCase())) return;
    responseHeaders[k] = v;
  });

  // preserve raw bytes
  const ab = await res.arrayBuffer();
  return new NextResponse(ab, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) { return proxyRequest(req); }
export async function POST(req: NextRequest) { return proxyRequest(req); }
export async function PUT(req: NextRequest) { return proxyRequest(req); }
export async function PATCH(req: NextRequest) { return proxyRequest(req); }
export async function DELETE(req: NextRequest) { return proxyRequest(req); }
