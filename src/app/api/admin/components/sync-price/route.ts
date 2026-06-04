import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  id: z.string().min(1),
  externalPrice: z.number().min(0).optional(),
});

/** Manual price sync — admin enters price from external store (no scraping) */
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, externalPrice } = schema.parse(await req.json());
  const component = await prisma.component.findUnique({ where: { id } });
  if (!component) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.component.update({
    where: { id },
    data: {
      externalPrice: externalPrice ?? component.externalPrice,
      lastPriceSyncAt: new Date(),
    },
  });

  return NextResponse.json({ component: updated });
}
