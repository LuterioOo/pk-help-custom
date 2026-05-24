import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { upsertSeedComponent } from "./seed-utils.ts";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const raw = readFileSync(join(__dirname, "data", "components-pl.json"), "utf-8");
  const rows = JSON.parse(raw) as Array<Record<string, unknown>>;

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const result = await upsertSeedComponent(prisma, row);
    if (result === "created") created++;
    else updated++;
  }

  const byCategory = await prisma.component.groupBy({
    by: ["category"],
    _count: { id: true },
    where: { active: true },
  });

  console.log(
    `Components seed: ${rows.length} catalog rows (${created} created, ${updated} updated).`
  );
  console.log(
    "Active by category:",
    byCategory.map((g) => `${g.category}:${g._count.id}`).join(", ")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
