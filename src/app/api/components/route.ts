import { NextRequest, NextResponse } from "next/server";
import { isDatabaseError } from "@/lib/db-config";
import { prisma } from "@/lib/prisma";
import type { ComponentCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as ComponentCategory | null;
  try {
    const components = await prisma.component.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ featured: "desc" }, { price: "asc" }],
    });
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
