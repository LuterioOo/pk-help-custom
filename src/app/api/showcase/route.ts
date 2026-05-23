import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const orderBy = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export async function GET() {
  try {
    const whereBase = { active: true, imageUrl: { not: null } };
    const [decorative, forSale] = await Promise.all([
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: false },
        orderBy,
      }),
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: true },
        orderBy,
      }),
    ]);
    return NextResponse.json({ items: decorative, forSale });
  } catch {
    return NextResponse.json({ items: [], forSale: [] });
  }
}
