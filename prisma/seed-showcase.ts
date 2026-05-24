import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

function isBlobUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes("blob.vercel-storage.com"));
}

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOWCASE_DIR = join(__dirname, "..", "public", "uploads", "showcase");
const META_PATH = join(__dirname, "data", "showcase-seed.json");

type MetaRow = {
  file: string;
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
  forSale?: boolean;
  showText?: boolean;
  pricePLN?: number | null;
  active?: boolean;
};

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

function loadMeta(): Map<string, MetaRow> {
  const map = new Map<string, MetaRow>();
  if (!existsSync(META_PATH)) return map;
  const rows = JSON.parse(readFileSync(META_PATH, "utf-8")) as MetaRow[];
  for (const row of rows) map.set(row.file, row);
  return map;
}

async function main() {
  if (!existsSync(SHOWCASE_DIR)) {
    console.log("Showcase seed skipped: folder public/uploads/showcase not found.");
    return;
  }

  const meta = loadMeta();
  const files = readdirSync(SHOWCASE_DIR).filter((f) => IMAGE_EXT.test(f));
  if (files.length === 0) {
    console.log("Showcase seed: no image files in public/uploads/showcase.");
    return;
  }

  let upserted = 0;
  for (const file of files) {
    const m = meta.get(file);
    const id = basename(file, extname(file));
    const imageUrl = `/uploads/showcase/${file}`;
    const existing = await prisma.showcaseBuild.findUnique({ where: { id } });
    const keepBlobUrl = isBlobUrl(existing?.imageUrl);

    await prisma.showcaseBuild.upsert({
      where: { id },
      create: {
        id,
        imageUrl,
        title: m?.title ?? null,
        caption: m?.caption ?? null,
        showText: m?.showText ?? false,
        forSale: m?.forSale ?? false,
        pricePLN: m?.forSale && m?.pricePLN != null ? m.pricePLN : null,
        sortOrder: m?.sortOrder ?? 0,
        active: m?.active ?? true,
      },
      update: {
        ...(keepBlobUrl ? {} : { imageUrl }),
        title: m?.title ?? undefined,
        caption: m?.caption ?? undefined,
        showText: m?.showText,
        forSale: m?.forSale,
        pricePLN: m?.forSale && m?.pricePLN != null ? m.pricePLN : null,
        sortOrder: m?.sortOrder,
        active: m?.active ?? true,
      },
    });
    upserted++;
  }

  console.log(`Showcase seed: ${upserted} image(s) → /uploads/showcase/ (works without Blob).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
