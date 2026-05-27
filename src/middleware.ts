import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isAdminPathname } from "./lib/admin-path";
import {
  getDefaultLocaleForSite,
  getLocalesForSite,
  isMainLocaleSegment,
  isPolishSite,
  polishSiteUrl,
} from "./lib/locale-path";
import { isPolishHost, isPreviewHost } from "./lib/site";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost";
  const pathname = request.nextUrl.pathname;
  const polishSite = isPolishSite(host, pathname);
  const allowedLocales = getLocalesForSite(host, pathname);
  const defaultLocale = getDefaultLocaleForSite(host, pathname);
  const segment = pathname.split("/")[1];
  const segmentLooksLikeLocale = Boolean(segment && /^[a-z]{2}$/i.test(segment));

  if (isAdminPathname(pathname)) {
    const response = intlMiddleware(request);
    response.headers.set("x-site-locale", defaultLocale);
    response.headers.set("x-site-polish", polishSite ? "1" : "0");
    return response;
  }

  // Main production domain: /pl → Polish site (separate domain)
  if (
    segment === "pl" &&
    !polishSite &&
    !isPreviewHost(host) &&
    !isPolishHost(host)
  ) {
    const rest = pathname.slice(3) || "";
    return NextResponse.redirect(polishSiteUrl(rest));
  }

  // Polish site: no RU/UK/EN in URL
  if (polishSite && segment && isMainLocaleSegment(segment)) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(segment.length + 1);
    url.pathname = isPolishHost(host)
      ? rest || "/"
      : rest
        ? `/pl${rest.startsWith("/") ? rest : `/${rest}`}`
        : "/pl";
    return NextResponse.redirect(url);
  }

  // Only validate/redirect when the first segment looks like a locale.
  // Otherwise, allow routes like /trade-in (default locale, localePrefix: as-needed).
  if (segmentLooksLikeLocale && segment && !allowedLocales.includes(segment)) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(segment.length + 1);
    url.pathname = polishSite
      ? rest
        ? isPolishHost(host)
          ? rest.startsWith("/")
            ? rest
            : `/${rest}`
          : `/pl${rest.startsWith("/") ? rest : `/${rest}`}`
        : isPolishHost(host)
          ? "/"
          : "/pl"
      : rest
        ? rest.startsWith("/")
          ? rest
          : `/${rest}`
        : "/";
    return NextResponse.redirect(url);
  }

  const response = intlMiddleware(request);
  response.headers.set("x-site-locale", defaultLocale);
  response.headers.set("x-site-polish", polishSite ? "1" : "0");
  return response;
}

export const config = {
  matcher: ["/", "/(ru|uk|en|pl)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
