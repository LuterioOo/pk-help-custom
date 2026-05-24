import type { ComponentCategory, PrismaClient } from "@prisma/client";
import { calculateMarkupPLN, resolveComponentPrice } from "../src/lib/pricing.ts";

export type SeedComponentRow = Record<string, unknown>;

export function seedIdentity(row: SeedComponentRow) {
  return {
    category: String(row.category),
    brand: String(row.brand),
    model: row.model ? String(row.model) : "",
    name: String(row.name),
  };
}

export function normalizeSeedRow(row: SeedComponentRow): SeedComponentRow {
  const base = Number(row.baseMarketPricePLN);
  if (!row.markupPLN && !row.price) {
    const markupPLN = calculateMarkupPLN(base);
    return { ...row, markupPLN, price: base + markupPLN };
  }
  return row;
}

export async function upsertSeedComponent(prisma: PrismaClient, row: SeedComponentRow) {
  const normalized = normalizeSeedRow(row);
  const { category, brand, model, name } = seedIdentity(normalized);
  const base = Number(normalized.baseMarketPricePLN);
  const { markupPLN, price } = resolveComponentPrice(
    base,
    normalized.markupPLN != null ? Number(normalized.markupPLN) : null,
    normalized.price != null ? Number(normalized.price) : null
  );

  const data = {
    category: category as ComponentCategory,
    name,
    namePl: name,
    brand,
    model: model || null,
    socket: normalized.socket ? String(normalized.socket) : null,
    chipset: normalized.chipset ? String(normalized.chipset) : null,
    wattage: normalized.wattage ? Number(normalized.wattage) : null,
    capacity: normalized.capacity ? String(normalized.capacity) : null,
    memoryType: normalized.memoryType ? String(normalized.memoryType) : null,
    formFactor: normalized.formFactor ? String(normalized.formFactor) : null,
    baseMarketPricePLN: base,
    markupPLN,
    price,
    sourceUrl: normalized.sourceUrl ? String(normalized.sourceUrl) : null,
    imageUrl: normalized.imageUrl ? String(normalized.imageUrl) : null,
    specs: (normalized.specs as object) ?? {},
    popularityScore: Number(normalized.popularityScore ?? 50),
    featured: Boolean(normalized.featured),
    active: true,
  };

  const existing = await prisma.component.findFirst({
    where: { category: data.category, brand, name, model: model || null },
  });

  if (existing) {
    const { imageUrl: _seedImage, ...rest } = data;
    await prisma.component.update({
      where: { id: existing.id },
      data: {
        ...rest,
        // Keep admin/Blob uploads unless seed JSON explicitly sets imageUrl
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
      },
    });
    return "updated" as const;
  }

  await prisma.component.create({ data });
  return "created" as const;
}
