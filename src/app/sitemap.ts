import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = ["", "/#builder", "/#order"];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}${locale === "ru" ? "" : `/${locale}`}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }))
  );
}
