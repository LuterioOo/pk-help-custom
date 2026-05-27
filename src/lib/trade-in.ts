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
  usedMarketPrice: number | null;
  estimatedUsedFromNew: boolean;
  tradeInPrice: number | null;
};

export type TradeInEstimate = {
  items: TradeInCalculatedItem[];
  estimatedTotal: number;
  hasManualItems: boolean;
};

const USED_FROM_NEW_RATIO = 0.65;
const TRADE_IN_RATIO = 0.7;

function sanitizePrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function calculateTradeInItem(item: TradeInInputItem): TradeInCalculatedItem {
  const usedMarketPriceRaw = sanitizePrice(item.usedMarketPrice);
  const newPriceRaw = sanitizePrice(item.newPrice);
  const usedMarketPrice = usedMarketPriceRaw ?? (newPriceRaw ? newPriceRaw * USED_FROM_NEW_RATIO : null);
  const tradeInPrice = usedMarketPrice ? Math.round(usedMarketPrice * TRADE_IN_RATIO) : null;

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    usedMarketPrice: usedMarketPrice ? Math.round(usedMarketPrice) : null,
    estimatedUsedFromNew: !usedMarketPriceRaw && Boolean(newPriceRaw),
    tradeInPrice,
  };
}

export function calculateTradeInEstimate(items: TradeInInputItem[]): TradeInEstimate {
  const calculated = items.map(calculateTradeInItem);
  const estimatedTotal = calculated.reduce((sum, item) => sum + (item.tradeInPrice ?? 0), 0);
  const hasManualItems = calculated.some((item) => item.tradeInPrice == null);

  return {
    items: calculated,
    estimatedTotal: Math.round(estimatedTotal),
    hasManualItems,
  };
}

