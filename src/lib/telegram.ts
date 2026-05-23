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

  return lines.join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
