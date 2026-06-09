import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SupportTopic } from "@prisma/client";
import { assertDatabaseUrl, isDatabaseError, isSchemaMissingError } from "@/lib/db-config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().min(3).max(2000),
  topic: z.nativeEnum(SupportTopic).optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  telegram: z.string().max(100).optional(),
  locale: z.enum(["pl", "ru", "uk", "en"]).optional(),
  currentPage: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { allowed } = checkRateLimit(`support:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertDatabaseUrl();
    const body = await req.json();
    const data = schema.parse(body);

    const record = await prisma.supportMessage.create({
      data: {
        message: data.message.trim(),
        topic: data.topic ?? SupportTopic.OTHER,
        name: data.name?.trim() || null,
        phone: data.phone?.trim() || null,
        telegram: data.telegram?.trim() || null,
        locale: data.locale ?? "ru",
        currentPage: data.currentPage?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ error: "Database schema not ready" }, { status: 503 });
    }
    if (isDatabaseError(error)) {
      console.error("Support message DB error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 503 });
    }
    console.error("Support message error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
