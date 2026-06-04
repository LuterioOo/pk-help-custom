import { NextRequest, NextResponse } from "next/server";
import { isDatabaseError } from "@/lib/db-config";
import { prisma } from "@/lib/prisma";
import { resolveEffectiveComponentPrice } from "@/lib/pricing";
import type { ComponentCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as ComponentCategory | null;
  try {
    const rows = await prisma.component.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ featured: "desc" }, { price: "asc" }],
    });
    const components = rows.map((c) => ({
      ...c,
      price: resolveEffectiveComponentPrice(c),
      usedMarketPrice: c.usedPrice ?? null,
    }));
    return NextResponse.json({ components });
  } catch (e) {
    if (isDatabaseError(e)) {
      console.error("GET /api/components database error:", e);
    } else {
      console.error("GET /api/components error:", e);
    }
    return NextResponse.json({ components: [] });
  }
}
