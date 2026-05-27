import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";
import { assertDatabaseUrl, isDatabaseError, isSchemaMissingError } from "@/lib/db-config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { scheduleOrderCrmSync } from "@/lib/crm";
import { formatOrderMessage, sendTelegramMessage, type TelegramLocale } from "@/lib/telegram";
import { isPolishHost } from "@/lib/site";
import { selectedComponentSchema, selectionToSelectedComponents } from "@/lib/order-components";
import type { BuildSelection } from "@/lib/compatibility";

export const runtime = "nodejs";
export const maxDuration = 30;

const emailSchema = z.union([z.string().email().max(200), z.literal("")]).optional();

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(30),
  email: emailSchema,
  messenger: z.string().max(100).optional(),
  telegram: z.string().max(100).optional(),
  services: z.array(z.string().max(100)).max(10).optional(),
  comment: z.string().max(2000).optional(),
  buildJson: z.record(z.string(), z.unknown()).optional(),
  selectedComponents: z.array(selectedComponentSchema).optional(),
  totalPrice: z.coerce.number().optional(),
  tradeInDiscountPLN: z.coerce.number().nonnegative().optional(),
  tradeInEstimate: z.record(z.string(), z.unknown()).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  locale: z.enum(["pl", "ru", "uk", "en"]).optional(),
  source: z.string().max(500).optional(),
});

function parseSelectedComponents(
  data: z.infer<typeof schema>
): ReturnType<typeof selectionToSelectedComponents> | undefined {
  if (data.selectedComponents?.length) {
    const parsed = z.array(selectedComponentSchema).safeParse(data.selectedComponents);
    if (parsed.success) return parsed.data;
  }
  if (data.buildJson && typeof data.buildJson === "object") {
    try {
      return selectionToSelectedComponents(data.buildJson as BuildSelection);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertDatabaseUrl();

    const body = await req.json();
    const data = schema.parse(body);
    const host = req.headers.get("host") ?? "";
    const locale: TelegramLocale =
      data.locale ?? (isPolishHost(host) ? "pl" : "ru");

    const referer = req.headers.get("referer")?.trim();
    const source =
      data.source?.trim() ||
      referer ||
      (host ? `${getSiteUrl()}${req.nextUrl.pathname}` : undefined);

    const email = data.email && data.email.length > 0 ? data.email : undefined;
    const messenger = data.messenger ?? data.telegram;
    const selectedComponents = parseSelectedComponents(data);
    const totalPrice =
      data.totalPrice != null && Number.isFinite(data.totalPrice)
        ? data.totalPrice
        : undefined;
    const tradeInDiscountPLN =
      data.tradeInDiscountPLN != null && Number.isFinite(data.tradeInDiscountPLN)
        ? Math.max(0, data.tradeInDiscountPLN)
        : undefined;

    const order = await prisma.order.create({
      data: {
        name: data.name,
        phone: data.phone,
        email,
        messenger,
        services: data.services ?? [],
        comment: data.comment,
        buildJson: (data.buildJson as Prisma.InputJsonValue) ?? undefined,
        selectedComponents: (selectedComponents as Prisma.InputJsonValue) ?? undefined,
        totalPrice,
        tradeInDiscountPLN,
        tradeInEstimate: (data.tradeInEstimate as Prisma.InputJsonValue) ?? undefined,
        status: data.status ?? undefined,
      },
    });

    try {
      const message = formatOrderMessage(
        {
          name: data.name,
          phone: data.phone,
          email,
          messenger,
          services: data.services,
          comment: data.comment,
          buildJson: data.buildJson,
          selectedComponents,
          totalPrice,
          tradeInDiscountPLN,
          tradeInEstimate: data.tradeInEstimate,
          source,
          createdAt: order.createdAt,
        },
        locale
      );
      const tg = await sendTelegramMessage(message);
      if (!tg.ok && !("skipped" in tg && tg.skipped)) {
        console.error("Telegram failed", tg);
      }
    } catch (tgErr) {
      console.error("Telegram error (order saved)", tgErr);
    }

    scheduleOrderCrmSync(order.id, source);

    return NextResponse.json({ success: true, id: order.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", message: "Validation failed", details: e.flatten() },
        { status: 400 }
      );
    }
    console.error("Order create error:", e);
    if (isSchemaMissingError(e)) {
      return NextResponse.json(
        {
          error: "Database schema missing",
          message: "Database schema missing. Run: npm run db:push",
        },
        { status: 503 }
      );
    }
    if (isDatabaseError(e)) {
      return NextResponse.json(
        { error: "Database unavailable", message: "Database unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Server error", message: "Server error" }, { status: 500 });
  }
}
