import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const list = await prisma.serviceStatus.findMany({ orderBy: { service: 'asc' } });
  return NextResponse.json(list);
}
