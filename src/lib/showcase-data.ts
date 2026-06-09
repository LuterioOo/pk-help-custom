import { prisma } from "@/lib/prisma";

const orderBy = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export type ShowcasePresetComponents = Partial<Record<string, string>>;

export type ShowcaseItem = {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  showText: boolean;
  pricePLN: number | null;
  presetComponents: ShowcasePresetComponents | null;
};

function parsePresetComponents(raw: unknown): ShowcasePresetComponents | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: ShowcasePresetComponents = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return Object.keys(out).length > 0 ? out : null;
}

function pickLocalized(
  locale: string,
  base: string | null | undefined,
  uk?: string | null,
  en?: string | null,
  pl?: string | null
): string | null {
  if (!base && !uk && !en && !pl) return null;
  if (locale === "uk" && uk) return uk;
  if (locale === "en" && en) return en;
  if (locale === "pl" && pl) return pl;
  return base ?? null;
}

export async function getShowcaseData(
  locale = "ru"
): Promise<{ items: ShowcaseItem[]; forSale: ShowcaseItem[] }> {
  try {
    const whereBase = { active: true, imageUrl: { not: null } };
    const select = {
      id: true,
      imageUrl: true,
      title: true,
      titleUk: true,
      titleEn: true,
      titlePl: true,
      caption: true,
      captionUk: true,
      captionEn: true,
      captionPl: true,
      showText: true,
      pricePLN: true,
      presetComponents: true,
    } as const;

    const [decorative, forSale] = await Promise.all([
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: false },
        orderBy,
        select,
      }),
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: true },
        orderBy,
        select,
      }),
    ]);

    const map = (rows: typeof decorative): ShowcaseItem[] =>
      rows
        .filter((r): r is typeof r & { imageUrl: string } => Boolean(r.imageUrl))
        .map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl,
          title: pickLocalized(locale, r.title, r.titleUk, r.titleEn, r.titlePl),
          caption: pickLocalized(locale, r.caption, r.captionUk, r.captionEn, r.captionPl),
          showText: r.showText,
          pricePLN: r.pricePLN,
          presetComponents: parsePresetComponents(r.presetComponents),
        }));

    return { items: map(decorative), forSale: map(forSale) };
  } catch {
    return { items: [], forSale: [] };
  }
}
