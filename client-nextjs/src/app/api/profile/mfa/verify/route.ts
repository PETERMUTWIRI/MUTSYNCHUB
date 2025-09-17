import { NextRequest, NextResponse } from 'next/server';
import { mfaServerApp } from '@/lib';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const jwt = cookies().get('mfa-jwt')?.value;
  if (!jwt) return NextResponse.json({ valid: false }, { status: 401 });

  const user = await mfaServerApp.getUser({ token: jwt });
  const valid = await user.verifyTotp({ code });
  return NextResponse.json({ valid });
}