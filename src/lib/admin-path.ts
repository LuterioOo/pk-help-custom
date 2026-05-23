/** Locale-prefixed admin URLs (next-intl as-needed: ru/pl without prefix). */
export function adminUrl(locale: string, subpath?: string): string {
  const usePrefix = locale !== "ru" && locale !== "pl";
  const base = usePrefix ? `/${locale}/admin` : "/admin";
  if (!subpath) return base;
  return `${base}/${subpath.replace(/^\//, "")}`;
}

export function isAdminPathname(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return /^\/(ru|uk|en|pl)\/admin(\/|$)/.test(pathname);
}
