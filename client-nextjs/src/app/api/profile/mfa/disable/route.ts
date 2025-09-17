import { stackServerApp } from '@/lib/stack.server';

export async function DELETE() {
  const user = await stackServerApp.getUser({ or: 'throw' });
  await user.disableTotp();
  return Response.json({ ok: true });
}