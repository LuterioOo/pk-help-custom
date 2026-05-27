import type { ComponentCategory } from "@prisma/client";

export type TradeInInputItem = {
  id?: string;
  name: string;
  category?: ComponentCategory | string;
  usedMarketPrice?: number | null;
  newPrice?: number | null;
};

export type TradeInCalculatedItem = {
  id?: string;
  name: string;
  category?: ComponentCategory | string;
  usedMarketPriceMin: number | null;
  usedMarketPriceMax: number | null;
  estimatedUsedFromNew: boolean;
  tradeInMin: number | null;
  tradeInMax: number | null;
  tradeInPrice: number | null; // average (for UX / promo coupon)
};

export type TradeInEstimate = {
  items: TradeInCalculatedItem[];
  estimatedTotal: number; // average coupon
  sumMin: number;
  sumMax: number;
  hasManualItems: boolean;
};

const TRADE_IN_RATIO = 0.7;
const USED_FROM_NEW_MIN_RATIO = 0.6;
const USED_FROM_NEW_MAX_RATIO = 0.7;

function sanitizePrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function calculateTradeInItem(item: TradeInInputItem): TradeInCalculatedItem {
  const usedMarketPriceRaw = sanitizePrice(item.usedMarketPrice);
  const newPriceRaw = sanitizePrice(item.newPrice);

  const usedMarketPriceMin =
    usedMarketPriceRaw != null ? usedMarketPriceRaw : newPriceRaw != null ? newPriceRaw * USED_FROM_NEW_MIN_RATIO : null;
  const usedMarketPriceMax =
    usedMarketPriceRaw != null ? usedMarketPriceRaw : newPriceRaw != null ? newPriceRaw * USED_FROM_NEW_MAX_RATIO : null;

  const tradeInMin = usedMarketPriceMin != null ? Math.round(usedMarketPriceMin * TRADE_IN_RATIO) : null;
  const tradeInMax = usedMarketPriceMax != null ? Math.round(usedMarketPriceMax * TRADE_IN_RATIO) : null;

  const tradeInPrice =
    tradeInMin != null && tradeInMax != null ? Math.round((tradeInMin + tradeInMax) / 2) : null;

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    usedMarketPriceMin: usedMarketPriceMin != null ? Math.round(usedMarketPriceMin) : null,
    usedMarketPriceMax: usedMarketPriceMax != null ? Math.round(usedMarketPriceMax) : null,
    estimatedUsedFromNew: usedMarketPriceRaw == null && newPriceRaw != null,
    tradeInMin,
    tradeInMax,
    tradeInPrice,
  };
}

export function calculateTradeInEstimate(items: TradeInInputItem[]): TradeInEstimate {
  const calculated = items.map(calculateTradeInItem);
  const sumMin = calculated.reduce((sum, item) => sum + (item.tradeInMin ?? 0), 0);
  const sumMax = calculated.reduce((sum, item) => sum + (item.tradeInMax ?? 0), 0);
  const estimatedTotal = Math.round((sumMin + sumMax) / 2);
  const hasManualItems = calculated.some((item) => item.tradeInMin == null || item.tradeInMax == null);

  return {
    items: calculated,
    estimatedTotal,
    sumMin: Math.round(sumMin),
    sumMax: Math.round(sumMax),
    hasManualItems,
  };
}

