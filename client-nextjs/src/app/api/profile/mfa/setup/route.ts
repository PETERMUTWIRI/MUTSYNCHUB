import { NextResponse } from 'next/server';
import { mfaServerApp } from '@/lib';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';
import { cookies } from 'next/headers';

export async function GET() {
  // 1.  who is calling (from Neon Auth cookie)
  const neonUser = await ensureAndFetchUserProfile();

  // 2.  create or fetch same user inside Stack-MFA project
  let mfaUser = await mfaServerApp.getUser({ userId: neonUser.userId }).catch(() => null);
  if (!mfaUser) {
    // shadow-create user (same id, same email)
    await mfaServerApp.createUser({
      userId: neonUser.userId,
      primaryEmail: neonUser.email,
    });
    mfaUser = await mfaServerApp.getUser({ userId: neonUser.userId });
  }

  // 3.  enable TOTP
  const secret = await mfaUser.createTotpSecret();
  const qrCodeUrl = await mfaUser.createQrCodeUrl(secret);

  // 4.  issue Stack JWT (http-only cookie) for future MFA gates
  const { accessToken } = await mfaUser.getAuthJson();
  cookies().set('mfa-jwt', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return NextResponse.json({ secret, qrCodeUrl });
}