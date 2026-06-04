import { prisma } from "@/lib/prisma";
import { isDatabaseError } from "@/lib/db-config";

export type MasterBuildItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  pricePLN: number | null;
  sortOrder: number;
};

export type MasterItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialization: string | null;
  description: string | null;
  rating: number;
  buildsCount: number;
  sortOrder: number;
  builds: MasterBuildItem[];
};

function pickLocalized(
  locale: string,
  base: string,
  uk?: string | null,
  en?: string | null,
  pl?: string | null
): string {
  if (locale === "uk" && uk) return uk;
  if (locale === "en" && en) return en;
  if (locale === "pl" && pl) return pl;
  return base;
}

export async function getMastersData(locale = "ru"): Promise<MasterItem[]> {
  try {
    const masters = await prisma.master.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        builds: {
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        },
      },
    });

    return masters.map((m) => ({
      id: m.id,
      name: pickLocalized(locale, m.name, m.nameUk, m.nameEn, m.namePl),
      avatarUrl: m.avatarUrl,
      specialization: pickLocalized(
        locale,
        m.specialization ?? "",
        m.specUk,
        m.specEn,
        m.specPl
      ) || null,
      description: m.description,
      rating: m.rating ?? 5,
      buildsCount: m.buildsCount > 0 ? m.buildsCount : m.builds.length,
      sortOrder: m.sortOrder,
      builds: m.builds.map((b) => ({
        id: b.id,
        title: pickLocalized(locale, b.title, b.titleUk, b.titleEn, b.titlePl),
        description: b.description,
        imageUrl: b.imageUrl,
        pricePLN: b.pricePLN,
        sortOrder: b.sortOrder,
      })),
    }));
  } catch (e) {
    if (isDatabaseError(e)) {
      console.error("getMastersData database error:", e);
    }
    return [];
  }
}
