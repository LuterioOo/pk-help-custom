import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isAdminPathname } from "./lib/admin-path";
import {
  getDefaultLocaleForHost,
  getLocalesForHost,
  isPolishHost,
} from "./lib/site";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost";
  const allowedLocales = getLocalesForHost(host);
  const defaultLocale = getDefaultLocaleForHost(host);
  const pathname = request.nextUrl.pathname;

  if (isAdminPathname(pathname)) {
    const response = intlMiddleware(request);
    response.headers.set("x-site-locale", defaultLocale);
    response.headers.set("x-site-polish", isPolishHost(host) ? "1" : "0");
    return response;
  }

  const segment = pathname.split("/")[1];
  if (segment && !allowedLocales.includes(segment)) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(segment.length + 1);
    url.pathname = rest ? (rest.startsWith("/") ? rest : `/${rest}`) : "/";
    return NextResponse.redirect(url);
  }

  const response = intlMiddleware(request);
  response.headers.set("x-site-locale", defaultLocale);
  response.headers.set("x-site-polish", isPolishHost(host) ? "1" : "0");
  return response;
}

export const config = {
  matcher: ["/", "/(ru|uk|en|pl)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
