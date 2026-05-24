import { prisma } from "@/lib/prisma";

const orderBy = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export type ShowcaseItem = {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  showText: boolean;
  pricePLN: number | null;
};

export async function getShowcaseData(): Promise<{ items: ShowcaseItem[]; forSale: ShowcaseItem[] }> {
  try {
    const whereBase = { active: true, imageUrl: { not: null } };
    const [decorative, forSale] = await Promise.all([
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: false },
        orderBy,
        select: {
          id: true,
          imageUrl: true,
          title: true,
          caption: true,
          showText: true,
          pricePLN: true,
        },
      }),
      prisma.showcaseBuild.findMany({
        where: { ...whereBase, forSale: true },
        orderBy,
        select: {
          id: true,
          imageUrl: true,
          title: true,
          caption: true,
          showText: true,
          pricePLN: true,
        },
      }),
    ]);

    const map = (rows: typeof decorative): ShowcaseItem[] =>
      rows
        .filter((r): r is typeof r & { imageUrl: string } => Boolean(r.imageUrl))
        .map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl,
          title: r.title,
          caption: r.caption,
          showText: r.showText,
          pricePLN: r.pricePLN,
        }));

    return { items: map(decorative), forSale: map(forSale) };
  } catch {
    return { items: [], forSale: [] };
  }
}
