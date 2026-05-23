export const MAIN_DOMAIN =
  process.env.NEXT_PUBLIC_MAIN_DOMAIN?.toLowerCase().replace(/^www\./, "") ?? "pk-help.pl";

export const POLISH_DOMAIN =
  process.env.NEXT_PUBLIC_POLISH_DOMAIN?.toLowerCase().replace(/^www\./, "") ?? "pk-help-pl.pl";

export const mainLocales = ["ru", "uk", "en"] as const;
export const polishLocales = ["pl"] as const;
export type MainLocale = (typeof mainLocales)[number];
export type PolishLocale = (typeof polishLocales)[number];

export function normalizeHost(host: string): string {
  return host.toLowerCase().split(":")[0].replace(/^www\./, "");
}

export function isPolishHost(host: string): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_LOCALE === "pl") return true;
  const h = normalizeHost(host);
  return h === POLISH_DOMAIN || h === `pl.${MAIN_DOMAIN}`;
}

export function getLocalesForHost(host: string): readonly string[] {
  return isPolishHost(host) ? polishLocales : mainLocales;
}

export function getDefaultLocaleForHost(host: string): string {
  return isPolishHost(host) ? "pl" : "ru";
}