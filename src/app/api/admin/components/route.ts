import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { resolveComponentPrice } from "@/lib/pricing";
import { isAllowedStoredImageUrl } from "@/lib/image-url";
import { removeComponentImageFiles, UPLOAD_URL_PREFIX } from "@/lib/component-image";
import type { ComponentCategory } from "@prisma/client";

const imageUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((v) => isAllowedStoredImageUrl(v ?? "", UPLOAD_URL_PREFIX), {
    message: "Invalid image URL",
  });

const componentSchema = z.object({
  category: z.string(),
  name: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().optional(),
  socket: z.string().optional(),
  chipset: z.string().optional(),
  wattage: z.number().int().optional(),
  capacity: z.string().optional(),
  memoryType: z.string().optional(),
  formFactor: z.string().optional(),
  baseMarketPricePLN: z.number().min(0),
  markupPLN: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  usedPrice: z.number().min(0).optional().nullable(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  externalPriceUrl: z.string().url().optional().or(z.literal("")),
  externalStoreName: z.string().max(100).optional().or(z.literal("")),
  externalPrice: z.number().min(0).optional().nullable(),
  manualPriceOverride: z.number().min(0).optional().nullable(),
  imageUrl: imageUrlSchema,
  specs: z.record(z.string(), z.unknown()).default({}),
  popularityScore: z.number().int().default(0),
  stock: z.number().int().default(10),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

function buildComponentData(data: z.infer<typeof componentSchema>) {
  const { price: manualPrice, markupPLN } = resolveComponentPrice(
    data.baseMarketPricePLN,
    data.markupPLN,
    data.price
  );
  const specs = {
    ...data.specs,
    ...(data.socket ? { socket: data.socket } : {}),
    ...(data.chipset ? { chipset: data.chipset } : {}),
    ...(data.wattage ? { wattage: data.wattage } : {}),
    ...(data.capacity ? { capacity: data.capacity } : {}),
    ...(data.memoryType ? { type: data.memoryType, ramType: data.memoryType } : {}),
    ...(data.formFactor ? { formFactor: data.formFactor } : {}),
  };

  return {
    category: data.category as ComponentCategory,
    name: data.name,
    brand: data.brand,
    model: data.model,
    socket: data.socket,
    chipset: data.chipset,
    wattage: data.wattage,
    capacity: data.capacity,
    memoryType: data.memoryType,
    formFactor: data.formFactor,
    baseMarketPricePLN: data.baseMarketPricePLN,
    markupPLN,
    price: manualPrice,
    usedPrice: data.usedPrice ?? null,
    sourceUrl: data.sourceUrl || null,
    externalPriceUrl: data.externalPriceUrl || null,
    externalStoreName: data.externalStoreName || null,
    externalPrice: data.externalPrice ?? null,
    manualPriceOverride: data.manualPriceOverride ?? null,
    imageUrl: data.imageUrl || null,
    specs,
    popularityScore: data.popularityScore,
    stock: data.stock,
    featured: data.featured,
    active: data.active,
  };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const components = await prisma.component.findMany({
    orderBy: [{ popularityScore: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ components });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = componentSchema.parse(await req.json());
  const component = await prisma.component.create({ data: buildComponentData(data) });
  return NextResponse.json({ component });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...rest } = body as { id: string } & z.infer<typeof componentSchema>;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const data = componentSchema.parse(rest);
  const component = await prisma.component.update({
    where: { id },
    data: buildComponentData(data),
  });
  return NextResponse.json({ component });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, active } = (await req.json()) as { id: string; active?: boolean };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const component = await prisma.component.update({
    where: { id },
    data: { active: active ?? undefined },
  });
  return NextResponse.json({ component });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await removeComponentImageFiles(id);
  await prisma.component.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
