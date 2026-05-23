import { defineRouting } from "next-intl/routing";
import { MAIN_DOMAIN, POLISH_DOMAIN, mainLocales, polishLocales } from "@/lib/site";

export const locales = [...mainLocales, ...polishLocales] as const;
export type Locale = (typeof locales)[number];

const isDev = process.env.NODE_ENV === "development";
const forcePl = process.env.NEXT_PUBLIC_FORCE_LOCALE === "pl";
const vercelHost = process.env.VERCEL_URL?.toLowerCase().replace(/^www\./, "");

/** Production: one locale set per domain. Dev/preview: single host with all locales. */
const productionDomains = [
  {
    domain: MAIN_DOMAIN,
    defaultLocale: "ru" as Locale,
    locales: [...mainLocales] as Locale[],
  },
  {
    domain: POLISH_DOMAIN,
    defaultLocale: "pl" as Locale,
    locales: [...polishLocales] as Locale[],
  },
];

if (vercelHost && !productionDomains.some((d) => d.domain === vercelHost)) {
  productionDomains.unshift({
    domain: vercelHost,
    defaultLocale: (forcePl ? "pl" : "ru") as Locale,
    locales: [...locales] as Locale[],
  });
}

const domains = isDev
  ? [
      {
        domain: "localhost",
        defaultLocale: (forcePl ? "pl" : "ru") as Locale,
        locales: (forcePl ? [...polishLocales] : [...mainLocales]) as Locale[],
      },
    ]
  : productionDomains;

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  localePrefix: "as-needed",
  domains,
});
