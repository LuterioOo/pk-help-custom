/**
 * Service markup on top of market (purchase) price in PLN.
 * Typical range: 100–150 PLN depending on part cost.
 */
export function calculateMarkupPLN(baseMarketPricePLN: number): number {
  if (baseMarketPricePLN <= 400) return 100;
  if (baseMarketPricePLN <= 1200) return 120;
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

/** Builder/catalog price: manual override → external → local DB price */
export function resolveEffectiveComponentPrice(component: {
  manualPriceOverride?: number | null;
  externalPrice?: number | null;
  price: number;
}): number {
  if (component.manualPriceOverride != null && component.manualPriceOverride > 0) {
    return component.manualPriceOverride;
  }
  if (component.externalPrice != null && component.externalPrice > 0) {
    return component.externalPrice;
  }
  return component.price;
}
