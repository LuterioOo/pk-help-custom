import type { Order, OrderStatus } from "@prisma/client";
import { getSiteUrl } from "@/lib/site-url";
import { parseOrderComponents } from "@/lib/order-components";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NOWE: "Новая / Nowe",
  W_TRAKCIE: "В работе / W trakcie",
  WYCENIONE: "Оценена / Wycenione",
  estimated_waiting_service: "Оценена ±, ждём в сервисе",
  ZAKONCZONE: "Завершена / Zakończone",
  ANULOWANE: "Отменена / Anulowane",
};

export function buildAdminOrderUrl(orderId: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  return `${base}/admin/dashboard?order=${orderId}`;
}

export function buildLeadTitle(order: Pick<Order, "name" | "services" | "totalPrice">): string {
  const hasBuild =
    order.services.some((s) => /сборк|build|konfigurac|pc/i.test(s)) ||
    order.totalPrice != null;
  const suffix = hasBuild ? " — PC build" : "";
  return `PK-HELP: ${order.name}${suffix}`;
}

export function formatOrderCrmNote(
  order: Pick<
    Order,
    | "id"
    | "name"
    | "phone"
    | "email"
    | "messenger"
    | "services"
    | "comment"
    | "totalPrice"
    | "status"
    | "createdAt"
    | "selectedComponents"
    | "buildJson"
    | "tradeInEstimate"
  >,
  extra?: { source?: string }
): string {
  const tradeInEstimate =
    order.tradeInEstimate && typeof order.tradeInEstimate === "object"
      ? (order.tradeInEstimate as Record<string, unknown>)
      : null;
  const lines: string[] = [
    "PK-HELP Custom — заявка на сайте",
    "",
    `ID заявки: ${order.id}`,
    `Админка: ${buildAdminOrderUrl(order.id)}`,
    `Дата: ${order.createdAt.toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
      dateStyle: "short",
      timeStyle: "short",
    })}`,
    `Статус: ${ORDER_STATUS_LABELS[order.status]}`,
    "",
    `Имя: ${order.name}`,
    `Телефон: ${order.phone}`,
  ];

  if (order.email) lines.push(`E-mail: ${order.email}`);
  if (order.messenger) lines.push(`Telegram / мессенджер: ${order.messenger}`);
  if (extra?.source?.trim()) lines.push(`Источник: ${extra.source.trim()}`);

  if (order.services.length > 0) {
    lines.push("", "Услуги / тип:");
    for (const s of order.services) lines.push(`• ${s}`);
  }

  if (order.totalPrice != null && Number.isFinite(order.totalPrice)) {
    lines.push("", `Бюджет / сумма сборки: ${order.totalPrice} PLN`);
  }
  if (tradeInEstimate && typeof tradeInEstimate.estimatedTotal === "number") {
    lines.push("", `Trade-In (предв.): ${tradeInEstimate.estimatedTotal} PLN`);
  }
  if (tradeInEstimate) {
    const installmentsRequested = Boolean(tradeInEstimate.installmentsRequested);
    const couponAppliedToBuild = Boolean(tradeInEstimate.couponAppliedToBuild);
    const couponAmount =
      typeof tradeInEstimate.estimatedTotal === "number"
        ? tradeInEstimate.estimatedTotal
        : null;
    const sourceType =
      typeof tradeInEstimate.sourceType === "string" ? tradeInEstimate.sourceType : "";
    lines.push(
      `Trade-In: ${sourceType === "trade_in" ? "да" : "нет"}`,
      `Рассрочка: ${installmentsRequested ? "да" : "нет"}`,
      `Купон применён к сборке: ${couponAppliedToBuild ? "да" : "нет"}`
    );
    if (couponAmount && couponAmount > 0) {
      lines.push(`Купон: ${couponAmount} PLN`);
    }
    if (sourceType) {
      lines.push(`Источник заявки: ${sourceType}`);
    }
  }

  const tradeInParts = extractTradeInParts(tradeInEstimate);
  if (tradeInParts.length > 0) {
    lines.push("", "СТАРОЕ ЖЕЛЕЗО КЛИЕНТА:");
    for (const part of tradeInParts) {
      lines.push(`• ${part.category}: ${part.name}`);
    }
  }

  lines.push("", "Что нужно сделать админу:");
  for (const task of deriveAdminTasks(order.services, tradeInEstimate)) {
    lines.push(`• ${task}`);
  }

  if (order.comment?.trim()) {
    lines.push("", "Комментарий клиента:", order.comment.trim());
  }

  const components = parseOrderComponents(order);
  if (components.length > 0) {
    lines.push("", "Комплектующие:");
    for (const c of components) {
      lines.push(`• ${c.category}: ${c.name} — ${c.finalPrice} PLN`);
    }
  }

  return lines.join("\n");
}

function extractTradeInParts(tradeInEstimate: Record<string, unknown> | null): Array<{ category: string; name: string }> {
  if (!tradeInEstimate) return [];
  const raw = Array.isArray(tradeInEstimate.items)
    ? tradeInEstimate.items
    : Array.isArray(tradeInEstimate.selectedParts)
      ? tradeInEstimate.selectedParts
      : [];
  return raw
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        category: String(row.category ?? "").toUpperCase(),
        name: String(row.name ?? ""),
      };
    })
    .filter((part) => ["GPU", "CPU", "RAM", "PSU"].includes(part.category) && part.name);
}

function deriveAdminTasks(
  services: string[],
  tradeInEstimate: Record<string, unknown> | null
): string[] {
  const lower = services.map((s) => s.toLowerCase());
  const isTradeIn =
    lower.some((s) => s.includes("trade")) ||
    String(tradeInEstimate?.sourceType ?? "") === "trade_in";
  const installmentsRequested = Boolean(tradeInEstimate?.installmentsRequested);
  if (isTradeIn) {
    return [
      "Проверить старое железо",
      "Подтвердить coupon",
      "Ожидаем клиента в сервисе",
      ...(installmentsRequested ? ["Отправить документы на рассрочку"] : []),
    ];
  }
  return [
    "Связаться с клиентом",
    "Уточнить сборку",
    "Подтвердить наличие",
    ...(installmentsRequested ? ["Отправить документы на рассрочку"] : []),
  ];
}
