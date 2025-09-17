import { NextRequest } from 'next/server';
import { stackServerApp } from '@/lib/stack';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser({ or: 'throw' });
  const { code } = await req.json();
  await user.enableTotp({ code });              // Stack validates & stores
  const backupCodes = await user.generateBackupCodes();
  return Response.json({ backupCodes });        // return 10 codes to show once
}