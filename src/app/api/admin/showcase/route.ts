import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isAllowedStoredImageUrl } from "@/lib/image-url";
import { removeShowcaseFiles, SHOWCASE_URL_PREFIX } from "@/lib/showcase-image";

const schema = z.object({
  title: z.string().max(200).optional().or(z.literal("")),
  caption: z.string().max(500).optional().or(z.literal("")),
  showText: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  forSale: z.boolean().default(false),
  pricePLN: z.number().min(0).optional().nullable(),
  installmentEnabled: z.boolean().default(true),
  tradeInLabel: z.string().max(100).optional().or(z.literal("")),
  presetComponents: z.record(z.string(), z.string()).optional().nullable(),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => isAllowedStoredImageUrl(v ?? "", SHOWCASE_URL_PREFIX), {
      message: "Invalid image URL",
    }),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.showcaseBuild.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  if (!data.imageUrl) {
    return NextResponse.json({ error: "Upload image first" }, { status: 400 });
  }
  const item = await prisma.showcaseBuild.create({
    data: {
      imageUrl: data.imageUrl,
      title: data.title || null,
      caption: data.caption || null,
      showText: data.showText,
      forSale: data.forSale,
      pricePLN: data.forSale && data.pricePLN != null ? data.pricePLN : null,
      installmentEnabled: data.installmentEnabled,
      tradeInLabel: data.tradeInLabel || null,
      presetComponents: data.presetComponents ?? undefined,
      sortOrder: data.sortOrder,
      active: data.active,
    },
  });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...rest } = body as { id: string } & z.infer<typeof schema>;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const data = schema.parse(rest);
  const item = await prisma.showcaseBuild.update({
    where: { id },
    data: {
      title: data.title || null,
      caption: data.caption || null,
      showText: data.showText,
      forSale: data.forSale,
      pricePLN: data.forSale && data.pricePLN != null ? data.pricePLN : null,
      installmentEnabled: data.installmentEnabled,
      tradeInLabel: data.tradeInLabel || null,
      presetComponents: data.presetComponents ?? undefined,
      sortOrder: data.sortOrder,
      active: data.active,
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    },
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, active } = (await req.json()) as { id: string; active?: boolean };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const item = await prisma.showcaseBuild.update({
    where: { id },
    data: { active: active ?? undefined },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await removeShowcaseFiles(id);
  await prisma.showcaseBuild.delete({ where: { id } });
  return NextResponse.json({ success: true });
}