import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const masterSchema = z.object({
  name: z.string().min(1),
  nameUk: z.string().optional(),
  nameEn: z.string().optional(),
  namePl: z.string().optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
  specialization: z.string().optional(),
  specUk: z.string().optional(),
  specEn: z.string().optional(),
  specPl: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  rating: z.number().min(0).max(5).optional(),
  buildsCount: z.number().int().min(0).optional(),
});

const buildSchema = z.object({
  masterId: z.string().min(1),
  title: z.string().min(1),
  titleUk: z.string().optional(),
  titleEn: z.string().optional(),
  titlePl: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  pricePLN: z.number().min(0).optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const masters = await prisma.master.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      builds: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
    },
  });
  return NextResponse.json({ masters });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const type = String(body.type ?? "master");
  const rest = { ...(body as Record<string, unknown>) };
  delete rest.type;

  if (type === "build") {
    const data = buildSchema.parse(rest);
    const build = await prisma.masterBuild.create({
      data: {
        masterId: data.masterId,
        title: data.title,
        titleUk: data.titleUk || null,
        titleEn: data.titleEn || null,
        titlePl: data.titlePl || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        pricePLN: data.pricePLN ?? null,
        sortOrder: data.sortOrder,
        active: data.active,
      },
    });
    return NextResponse.json({ build });
  }

  const data = masterSchema.parse(rest);
  const master = await prisma.master.create({
    data: {
      name: data.name,
      nameUk: data.nameUk || null,
      nameEn: data.nameEn || null,
      namePl: data.namePl || null,
      avatarUrl: data.avatarUrl || null,
      specialization: data.specialization || null,
      specUk: data.specUk || null,
      specEn: data.specEn || null,
      specPl: data.specPl || null,
      description: data.description || null,
      rating: data.rating ?? 5,
      buildsCount: data.buildsCount ?? 0,
      sortOrder: data.sortOrder,
      active: data.active,
    },
  });
  return NextResponse.json({ master });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const type = String(body.type ?? "master");
  const rest = { ...(body as Record<string, unknown>) };
  const id = String(rest.id ?? "");
  delete rest.id;
  delete rest.type;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "build") {
    const data = buildSchema.partial().parse(rest);
    const build = await prisma.masterBuild.update({
      where: { id },
      data: {
        ...(data.title != null ? { title: data.title } : {}),
        titleUk: data.titleUk ?? undefined,
        titleEn: data.titleEn ?? undefined,
        titlePl: data.titlePl ?? undefined,
        description: data.description ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
        pricePLN: data.pricePLN ?? undefined,
        sortOrder: data.sortOrder ?? undefined,
        active: data.active ?? undefined,
        masterId: data.masterId ?? undefined,
      },
    });
    return NextResponse.json({ build });
  }

  const data = masterSchema.partial().parse(rest);
  const master = await prisma.master.update({
    where: { id },
    data: {
      ...(data.name != null ? { name: data.name } : {}),
      nameUk: data.nameUk ?? undefined,
      nameEn: data.nameEn ?? undefined,
      namePl: data.namePl ?? undefined,
      avatarUrl: data.avatarUrl ?? undefined,
      specialization: data.specialization ?? undefined,
      specUk: data.specUk ?? undefined,
      specEn: data.specEn ?? undefined,
      specPl: data.specPl ?? undefined,
      description: data.description ?? undefined,
      sortOrder: data.sortOrder ?? undefined,
      active: data.active ?? undefined,
      rating: data.rating ?? undefined,
      buildsCount: data.buildsCount ?? undefined,
    },
  });
  return NextResponse.json({ master });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, active, type } = (await req.json()) as {
    id: string;
    active?: boolean;
    type?: string;
  };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "build") {
    const build = await prisma.masterBuild.update({
      where: { id },
      data: { active: active ?? undefined },
    });
    return NextResponse.json({ build });
  }

  const master = await prisma.master.update({
    where: { id },
    data: { active: active ?? undefined },
  });
  return NextResponse.json({ master });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") ?? "master";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "build") {
    await prisma.masterBuild.delete({ where: { id } });
  } else {
    await prisma.master.delete({ where: { id } });
  }
  return NextResponse.json({ success: true });
}
