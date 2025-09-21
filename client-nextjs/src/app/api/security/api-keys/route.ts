import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';   // ← add this line
import { randomUUID } from 'crypto';

export async function GET() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const { name, scopes } = await req.json();
  const key = await prisma.apiKey.create({ data: { name, keyPreview: randomUUID().slice(-8), scopes } });
  return NextResponse.json(key);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.apiKey.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}