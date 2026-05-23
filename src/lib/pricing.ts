export function calculateMarkupPLN(baseMarketPricePLN: number): number {
  if (baseMarketPricePLN <= 300) return 50;
  if (baseMarketPricePLN <= 800) return 80;
  if (baseMarketPricePLN <= 1500) return 120;
  return 150;
}

export function resolveComponentPrice(
  baseMarketPricePLN: number,
  markupPLN?: number | null,
  manualPrice?: number | null
): { markupPLN: number; price: number } {
  if (manualPrice != null && manualPrice > 0) {
    const markup = markupPLN ?? Math.max(0, manualPrice - baseMarketPricePLN);
    return { markupPLN: markup, price: manualPrice };
  }
  const markup = markupPLN ?? calculateMarkupPLN(baseMarketPricePLN);
  return { markupPLN: markup, price: baseMarketPricePLN + markup };
}