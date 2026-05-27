import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { scheduleCrmStatusNote } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: status && status !== "all" ? { status: status as OrderStatus } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(OrderStatus).optional(),
  taskStatus: z.string().max(40).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  docsSent: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = patchSchema.parse(await req.json());
  const previous = await prisma.order.findUnique({ where: { id: data.id } });
  const previousMeta =
    previous?.tradeInEstimate && typeof previous.tradeInEstimate === "object"
      ? (previous.tradeInEstimate as Record<string, unknown>)
      : {};
  const order = await prisma.order.update({
    where: { id: data.id },
    data: {
      status: data.status,
      tradeInEstimate: {
        ...previousMeta,
        taskStatus: data.taskStatus ?? previousMeta.taskStatus ?? "new",
        priority: data.priority ?? previousMeta.priority ?? "medium",
        docsSent:
          typeof data.docsSent === "boolean" ? data.docsSent : Boolean(previousMeta.docsSent),
      },
    },
  });
  if (data.status && previous?.status !== data.status) {
    scheduleCrmStatusNote(order);
  }
  return NextResponse.json({ order });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
