import type { ComponentCategory } from "@prisma/client";
import {
  checkCompatibility,
  getTotalPrice,
  type BuildSelection,
  type ComponentSpec,
  type CompatibilityIssue,
} from "@/lib/compatibility";

export type UseCase = "gaming" | "streaming" | "work" | "creative";

const PICK_ORDER: ComponentCategory[] = [
  "CASE",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "PSU",
  "COOLER",
  "SSD",
];

/** Share of total budget allocated per category (sums to ~1). */
const BUDGET_SPLIT: Record<UseCase, Partial<Record<ComponentCategory, number>>> = {
  gaming: { CASE: 0.08, CPU: 0.17, MOTHERBOARD: 0.1, RAM: 0.08, GPU: 0.38, PSU: 0.08, COOLER: 0.05, SSD: 0.06 },
  streaming: { CASE: 0.08, CPU: 0.2, MOTHERBOARD: 0.1, RAM: 0.12, GPU: 0.28, PSU: 0.08, COOLER: 0.05, SSD: 0.09 },
  work: { CASE: 0.08, CPU: 0.24, MOTHERBOARD: 0.12, RAM: 0.18, GPU: 0.12, PSU: 0.08, COOLER: 0.05, SSD: 0.13 },
  creative: { CASE: 0.08, CPU: 0.21, MOTHERBOARD: 0.1, RAM: 0.14, GPU: 0.3, PSU: 0.08, COOLER: 0.05, SSD: 0.14 },
};

function hasErrors(issues: CompatibilityIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}

function pickBest(
  candidates: ComponentSpec[],
  maxPrice: number,
  selection: BuildSelection
): ComponentSpec | null {
  const compatible = candidates
    .filter((c) => c.price <= maxPrice)
    .filter((c) => {
      const trial = { ...selection, [c.category]: c };
      return !hasErrors(checkCompatibility(trial));
    })
    .sort((a, b) => b.price - a.price);

  if (compatible.length > 0) return compatible[0];

  const fallback = candidates
    .filter((c) => {
      const trial = { ...selection, [c.category]: c };
      return !hasErrors(checkCompatibility(trial));
    })
    .sort((a, b) => a.price - b.price);

  return fallback[0] ?? null;
}

function minPsuWattage(selection: BuildSelection): number {
  let required = 150;
  const cpu = selection.CPU;
  const gpu = selection.GPU;
  if (cpu) required += (cpu.specs.tdp as number) ?? 65;
  if (gpu) required += (gpu.specs.tdp as number) ?? 200;
  return required + 80;
}

export type AdvisorResult = {
  selection: BuildSelection;
  total: number;
  withinBudget: boolean;
  issues: CompatibilityIssue[];
};

export function recommendBuild(
  budget: number,
  useCase: UseCase,
  byCategory: Partial<Record<ComponentCategory, ComponentSpec[]>>
): AdvisorResult {
  const selection: BuildSelection = {};
  const split = BUDGET_SPLIT[useCase];
  let spent = 0;

  for (const cat of PICK_ORDER) {
    const pool = byCategory[cat] ?? [];
    if (pool.length === 0) continue;

    const share = split[cat] ?? 0.08;
    let maxPrice = Math.round(budget * share);

    if (cat === "PSU" && selection.GPU) {
      const minW = minPsuWattage(selection);
      const psuPool = pool.filter((p) => ((p.specs.wattage as number) ?? 0) >= minW);
      const psu = pickBest(psuPool.length > 0 ? psuPool : pool, Math.max(maxPrice, budget - spent), selection);
      if (psu) {
        selection.PSU = psu;
        spent += psu.price;
      }
      continue;
    }

    const remaining = budget - spent;
    maxPrice = Math.min(maxPrice, remaining);

    const picked = pickBest(pool, maxPrice, selection);
    if (picked) {
      selection[cat] = picked;
      spent += picked.price;
    }
  }

  const total = getTotalPrice(selection);
  const issues = checkCompatibility(selection);

  return {
    selection,
    total,
    withinBudget: total <= budget,
    issues: issues.filter((i) => i.level === "error"),
  };
}

export function groupComponentsByCategory(
  components: Array<{
    id: string;
    name: string;
    category: ComponentCategory;
    price: number;
    baseMarketPricePLN?: number;
    markupPLN?: number;
    specs: Record<string, unknown>;
  }>
): Partial<Record<ComponentCategory, ComponentSpec[]>> {
  const out: Partial<Record<ComponentCategory, ComponentSpec[]>> = {};
  for (const c of components) {
    const spec: ComponentSpec = {
      id: c.id,
      name: c.name,
      category: c.category,
      price: c.price,
      baseMarketPricePLN: c.baseMarketPricePLN ?? Math.max(0, c.price - (c.markupPLN ?? 0)),
      markupPLN: c.markupPLN ?? 0,
      specs: c.specs ?? {},
    };
    if (!out[c.category]) out[c.category] = [];
    out[c.category]!.push(spec);
  }
  return out;
}
