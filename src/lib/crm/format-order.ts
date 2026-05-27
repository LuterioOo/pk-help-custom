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
    const sourceType =
      typeof tradeInEstimate.sourceType === "string" ? tradeInEstimate.sourceType : "";
    lines.push(
      `Рассрочка: ${installmentsRequested ? "да" : "нет"}`,
      `Купон применён к сборке: ${couponAppliedToBuild ? "да" : "нет"}`
    );
    if (sourceType) {
      lines.push(`Источник заявки: ${sourceType}`);
    }
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
