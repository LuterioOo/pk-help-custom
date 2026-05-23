import type { BuildSelection, ComponentSpec } from "@/lib/compatibility";
import type { ComponentCategory } from "@prisma/client";
import { z } from "zod";

export const selectedComponentSchema = z.object({
  category: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  markup: z.coerce.number(),
  finalPrice: z.coerce.number(),
});

export type SelectedComponent = z.infer<typeof selectedComponentSchema>;

const CATEGORY_ORDER: ComponentCategory[] = [
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "SSD",
  "HDD",
  "PSU",
  "CASE",
  "COOLER",
  "AIO",
  "FANS",
];

function categorySortIndex(category: string): number {
  const idx = CATEGORY_ORDER.indexOf(category as ComponentCategory);
  return idx === -1 ? 999 : idx;
}

export function specToSelectedComponent(spec: ComponentSpec): SelectedComponent {
  const markup = Number(spec.markupPLN ?? 0);
  const finalPrice = Number(spec.price ?? 0);
  const base = Number(
    spec.baseMarketPricePLN ?? Math.max(0, finalPrice - markup)
  );
  return {
    category: spec.category,
    name: spec.name,
    price: base,
    markup,
    finalPrice,
  };
}

export function selectionToSelectedComponents(selection: BuildSelection): SelectedComponent[] {
  return Object.values(selection)
    .filter((c): c is ComponentSpec => Boolean(c))
    .map(specToSelectedComponent)
    .sort((a, b) => categorySortIndex(a.category) - categorySortIndex(b.category));
}

function normalizeComponent(raw: unknown): SelectedComponent | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const name = typeof c.name === "string" ? c.name : "";
  if (!name) return null;

  const category = typeof c.category === "string" ? c.category : "OTHER";
  const finalPrice = Number(c.finalPrice ?? c.price ?? 0);
  const markup = Number(c.markup ?? c.markupPLN ?? 0);
  const base = Number(c.price ?? c.baseMarketPricePLN ?? Math.max(0, finalPrice - markup));

  return {
    category,
    name,
    price: base,
    markup,
    finalPrice: finalPrice || base + markup,
  };
}

export function parseOrderComponents(order: {
  selectedComponents?: unknown;
  buildJson?: unknown;
}): SelectedComponent[] {
  if (Array.isArray(order.selectedComponents)) {
    const parsed = order.selectedComponents
      .map(normalizeComponent)
      .filter((c): c is SelectedComponent => c !== null);
    if (parsed.length > 0) {
      return parsed.sort((a, b) => categorySortIndex(a.category) - categorySortIndex(b.category));
    }
  }

  if (order.buildJson && typeof order.buildJson === "object" && !Array.isArray(order.buildJson)) {
    const entries = Object.entries(order.buildJson as Record<string, unknown>);
    const parsed = entries
      .map(([catKey, comp]) =>
        normalizeComponent(
          typeof comp === "object" && comp
            ? { ...(comp as Record<string, unknown>), category: (comp as Record<string, unknown>).category ?? catKey }
            : null
        )
      )
      .filter((c): c is SelectedComponent => c !== null);
    return parsed.sort((a, b) => categorySortIndex(a.category) - categorySortIndex(b.category));
  }

  return [];
}

export function sumComponents(components: SelectedComponent[]) {
  const componentsSum = components.reduce((s, c) => s + c.price, 0);
  const markupSum = components.reduce((s, c) => s + c.markup, 0);
  const finalSum = components.reduce((s, c) => s + c.finalPrice, 0);
  return { componentsSum, markupSum, finalSum };
}