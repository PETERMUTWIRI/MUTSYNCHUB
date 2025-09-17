import { NextRequest } from "next/server";
import { ensureAndFetchUserProfile } from "@/app/api/get-user-role/action";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await ensureAndFetchUserProfile();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.userId } });
  return Response.json(profile);
}

export async function PATCH(req: NextRequest) {
  const user = await ensureAndFetchUserProfile();
  const { firstName, lastName, email } = await req.json();
  await prisma.userProfile.update({
    where: { userId: user.userId },
    data: { firstName, lastName, email },
  });
  return Response.json({ ok: true });
}