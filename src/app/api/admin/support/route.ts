import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SupportMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const messages = await prisma.supportMessage.findMany({
    where:
      status && status !== "all"
        ? { status: status as SupportMessageStatus }
        : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ messages });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(SupportMessageStatus).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = patchSchema.parse(await req.json());
  const message = await prisma.supportMessage.update({
    where: { id: data.id },
    data: { status: data.status },
  });

  return NextResponse.json({ message });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.supportMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
