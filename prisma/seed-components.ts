import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

function calculateMarkupPLN(base: number) {
  if (base <= 300) return 50;
  if (base <= 800) return 80;
  if (base <= 1500) return 120;
  return 150;
}

async function main() {
  const raw = readFileSync(join(__dirname, "data", "components-pl.json"), "utf-8");
  const rows = JSON.parse(raw) as Array<Record<string, unknown>>;

  await prisma.component.deleteMany();

  for (const row of rows) {
    const base = Number(row.baseMarketPricePLN);
    const markupPLN = Number(row.markupPLN ?? calculateMarkupPLN(base));
    const price = Number(row.price ?? base + markupPLN);
    await prisma.component.create({
      data: {
        category: row.category as never,
        name: String(row.name),
        namePl: String(row.name),
        brand: String(row.brand),
        model: row.model ? String(row.model) : null,
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
      },
    });
  }

  console.log(`Seeded ${rows.length} components.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
