export type TelegramLocale = "pl" | "ru" | "uk" | "en";

const TELEGRAM_TIMEOUT_MS = 10_000;

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.warn("Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)");
    return { ok: false, skipped: true as const };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      console.error("Telegram API error:", data.description ?? res.status);
    }
    return { ok: Boolean(res.ok && data.ok), data };
  } catch (err) {
    console.error("Telegram request failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

import { parseOrderComponents } from "@/lib/order-components";

function formatOrderDate(locale: TelegramLocale): string {
  const tz = "Europe/Warsaw";
  const tag = locale === "pl" ? "pl-PL" : locale === "uk" ? "uk-UA" : locale === "en" ? "en-GB" : "ru-RU";
  return new Date().toLocaleString(tag, { timeZone: tz, dateStyle: "short", timeStyle: "short" });
}

export function formatOrderMessage(
  order: {
    name: string;
    phone: string;
    email?: string | null;
    messenger?: string | null;
    telegram?: string | null;
    services?: string[];
    comment?: string | null;
    totalPrice?: number | null;
    tradeInDiscountPLN?: number | null;
    tradeInEstimate?: unknown;
    installmentsRequested?: boolean;
    couponAppliedToBuild?: boolean;
    sourceType?: string;
    buildJson?: unknown;
    selectedComponents?: unknown;
    source?: string | null;
    createdAt?: Date | string | null;
  },
  locale: TelegramLocale = "pl"
) {
  const isPl = locale === "pl";
  const lines = [
    isPl
      ? "🖥 <b>PK-HELP Custom — Nowe zgłoszenie</b>"
      : "🖥 <b>PK-HELP Custom — Новая заявка</b>",
    "",
    `🕐 <b>${isPl ? "Data" : "Дата"}:</b> ${escapeHtml(
      order.createdAt
        ? new Date(order.createdAt).toLocaleString(isPl ? "pl-PL" : "ru-RU", {
            timeZone: "Europe/Warsaw",
            dateStyle: "short",
            timeStyle: "short",
          })
        : formatOrderDate(locale)
    )}`,
  ];

  if (order.source?.trim()) {
    lines.push(
      `🔗 <b>${isPl ? "Źródło / strona" : "Источник / страница"}:</b> ${escapeHtml(order.source.trim())}`
    );
  }

  lines.push(
    "",
    `👤 <b>${isPl ? "Imię" : "Имя"}:</b> ${escapeHtml(order.name)}`,
    `📞 <b>${isPl ? "Telefon" : "Телефон"}:</b> ${escapeHtml(order.phone)}`
  );

  const email = order.email;
  if (email) lines.push(`📧 <b>E-mail:</b> ${escapeHtml(email)}`);

  const messenger = order.messenger ?? order.telegram;
  if (messenger) {
    lines.push(
      `✈️ <b>${isPl ? "Telegram/WhatsApp" : "Telegram"}:</b> ${escapeHtml(messenger)}`
    );
  }

  if (order.services?.length) {
    lines.push(`\n🛠 <b>${isPl ? "Usługi" : "Услуги"}:</b>`);
    for (const s of order.services) lines.push(`• ${escapeHtml(s)}`);
  }

  if (order.totalPrice) {
    lines.push(
      `💵 <b>${isPl ? "Cena końcowa" : "Сумма сборки"}:</b> ${order.totalPrice} PLN`
    );
  }

  if (order.tradeInDiscountPLN && order.tradeInDiscountPLN > 0) {
    lines.push(
      `🏷 <b>${isPl ? "Trade-In (wstępnie)" : "Trade-In (предв.)"}:</b> -${order.tradeInDiscountPLN} PLN`
    );
  }
  if (
    order.tradeInEstimate &&
    typeof order.tradeInEstimate === "object" &&
    typeof (order.tradeInEstimate as Record<string, unknown>).estimatedTotal === "number"
  ) {
    lines.push(
      `🎟 <b>${isPl ? "Купон Trade-In (предв.)" : "Купон Trade-In (предв.)"}:</b> ${
        (order.tradeInEstimate as Record<string, unknown>).estimatedTotal
      } PLN`
    );
  }

  const estimateMeta =
    order.tradeInEstimate && typeof order.tradeInEstimate === "object"
      ? (order.tradeInEstimate as Record<string, unknown>)
      : null;
  const installmentsRequested =
    Boolean(order.installmentsRequested) || Boolean(estimateMeta?.installmentsRequested);
  const couponAppliedToBuild =
    Boolean(order.couponAppliedToBuild) || Boolean(estimateMeta?.couponAppliedToBuild);
  const sourceType = String(order.sourceType ?? estimateMeta?.sourceType ?? "").trim();

  if (sourceType) {
    lines.push(`🧭 <b>Source:</b> ${escapeHtml(sourceType)}`);
  }
  lines.push(
    `🔁 <b>Trade-In:</b> ${sourceType === "trade_in" ? (isPl ? "tak" : "да") : (isPl ? "nie" : "нет")}`
  );
  lines.push(
    `💳 <b>${isPl ? "Raty" : "Рассрочка"}:</b> ${
      installmentsRequested ? (isPl ? "tak" : "да") : (isPl ? "nie" : "нет")
    }`
  );
  lines.push(
    `🎫 <b>${isPl ? "Kupon zastosowany" : "Купон применён"}:</b> ${
      couponAppliedToBuild ? (isPl ? "tak" : "да") : (isPl ? "nie" : "нет")
    }`
  );

  if (order.comment) {
    lines.push(
      `\n📝 <b>${isPl ? "Komentarz" : "Комментарий"}:</b>\n${escapeHtml(order.comment)}`
    );
  }

  const components = parseOrderComponents(order);
  if (components.length > 0) {
    lines.push(`\n⚙️ <b>${isPl ? "Wybrane komponenty" : "Выбранные комплектующие"}:</b>`);
    for (const comp of components) {
      lines.push(
        `• <b>${escapeHtml(comp.category)}:</b> ${escapeHtml(comp.name)} — ${comp.finalPrice} PLN`
      );
    }
  }

  const tradeInParts = extractTradeInParts(estimateMeta);
  if (tradeInParts.length > 0) {
    lines.push(`\n🧩 <b>СТАРОЕ ЖЕЛЕЗО КЛИЕНТА:</b>`);
    for (const part of tradeInParts) {
      lines.push(`• <b>${escapeHtml(part.category)}:</b> ${escapeHtml(part.name)}`);
    }
  }

  lines.push(`\n✅ <b>Что нужно сделать админу:</b>`);
  for (const task of deriveAdminTasks(order.services ?? [], estimateMeta)) {
    lines.push(`• ${escapeHtml(task)}`);
  }

  return lines.join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function extractTradeInParts(
  estimateMeta: Record<string, unknown> | null
): Array<{ category: string; name: string }> {
  if (!estimateMeta) return [];
  const raw = Array.isArray(estimateMeta.items)
    ? estimateMeta.items
    : Array.isArray(estimateMeta.selectedParts)
      ? estimateMeta.selectedParts
      : [];
  return raw
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        category: String(item.category ?? "").toUpperCase(),
        name: String(item.name ?? ""),
      };
    })
    .filter((part) => ["GPU", "CPU", "RAM", "PSU"].includes(part.category) && part.name);
}

function deriveAdminTasks(services: string[], estimateMeta: Record<string, unknown> | null): string[] {
  const lower = services.map((s) => s.toLowerCase());
  const isTradeIn =
    lower.some((s) => s.includes("trade")) ||
    String(estimateMeta?.sourceType ?? "") === "trade_in";
  const installmentsRequested = Boolean(estimateMeta?.installmentsRequested);
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
