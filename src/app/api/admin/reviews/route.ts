import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ reviews });
}

const schema = z.object({
  name: z.string(),
  text: z.string(),
  rating: z.number().min(1).max(5),
  avatarUrl: z.string().optional(),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  const review = await prisma.review.create({ data });
  return NextResponse.json({ review });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
