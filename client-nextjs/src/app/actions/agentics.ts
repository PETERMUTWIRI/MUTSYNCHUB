'use server';
import { prisma } from '@/lib/prisma';

export async function ping() {
  // simplest possible server action
  return { pong: true };
}
