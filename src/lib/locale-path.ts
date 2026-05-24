import {
  isPolishHost,
  isPreviewHost,
  mainLocales,
  polishLocales,
  POLISH_DOMAIN,
} from "@/lib/site";

/** Polish-only site: dedicated domain or /pl on Vercel preview */
export function isPolishSite(host: string, pathname: string): boolean {
  if (isPolishHost(host)) return true;
  if (!isPreviewHost(host)) return false;
  return pathname === "/pl" || pathname.startsWith("/pl/");
}

export function getLocalesForSite(host: string, pathname: string): readonly string[] {
  return isPolishSite(host, pathname) ? polishLocales : mainLocales;
}

export function getDefaultLocaleForSite(host: string, pathname: string): string {
  return isPolishSite(host, pathname) ? "pl" : "ru";
}

/** Base path for hash links (#builder) */
export function localeBasePath(locale: string, host: string, pathname: string): string {
  if (isPolishSite(host, pathname)) {
    return isPolishHost(host) ? "" : "/pl";
  }
  return locale === "ru" ? "" : `/${locale}`;
}

export function polishSiteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_POLISH_SITE_URL?.replace(/\/$/, "") ||
    `https://${POLISH_DOMAIN}`;
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${suffix}`;
}

export function isMainLocaleSegment(segment: string): boolean {
  return (mainLocales as readonly string[]).includes(segment);
}
