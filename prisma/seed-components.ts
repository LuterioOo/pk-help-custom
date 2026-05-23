import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient, type ComponentCategory } from "@prisma/client";
import { calculateMarkupPLN, resolveComponentPrice } from "../src/lib/pricing.ts";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

type SeedRow = Record<string, unknown>;

function seedIdentity(row: SeedRow) {
  const category = String(row.category);
  const brand = String(row.brand);
  const model = row.model ? String(row.model) : "";
  const name = String(row.name);
  return { category, brand, model, name };
}

async function upsertComponent(row: SeedRow) {
  const { category, brand, model, name } = seedIdentity(row);
  const base = Number(row.baseMarketPricePLN);
  const { markupPLN, price } = resolveComponentPrice(
    base,
    row.markupPLN != null ? Number(row.markupPLN) : null,
    row.price != null ? Number(row.price) : null
  );

  const data = {
    category: category as ComponentCategory,
    name,
    namePl: name,
    brand,
    model: model || null,
    socket: row.socket ? String(row.socket) : null,
    chipset: row.chipset ? String(row.chipset) : null,
    wattage: row.wattage ? Number(row.wattage) : null,
    capacity: row.capacity ? String(row.capacity) : null,
    memoryType: row.memoryType ? String(row.memoryType) : null,
    formFactor: row.formFactor ? String(row.formFactor) : null,
    baseMarketPricePLN: base,
    markupPLN,
    price,
    sourceUrl: row.sourceUrl ? String(row.sourceUrl) : null,
    imageUrl: row.imageUrl ? String(row.imageUrl) : null,
    specs: (row.specs as object) ?? {},
    popularityScore: Number(row.popularityScore ?? 50),
    featured: Boolean(row.featured),
    active: true,
  };

  const existing = await prisma.component.findFirst({
    where: { category: data.category, brand, name, model: model || null },
  });

  if (existing) {
    await prisma.component.update({ where: { id: existing.id }, data });
    return "updated";
  }

  await prisma.component.create({ data });
  return "created";
}

async function main() {
  const raw = readFileSync(join(__dirname, "data", "components-pl.json"), "utf-8");
  const rows = JSON.parse(raw) as SeedRow[];

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const base = Number(row.baseMarketPricePLN);
    if (!row.markupPLN && !row.price) {
      row.markupPLN = calculateMarkupPLN(base);
      row.price = base + Number(row.markupPLN);
    }
    const result = await upsertComponent(row);
    if (result === "created") created++;
    else updated++;
  }

  console.log(
    `Components seed: ${rows.length} rows (${created} created, ${updated} updated, markup via pricing.ts).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
