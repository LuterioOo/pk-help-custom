export const SITE_THEME_IDS = ["yellow", "black", "white", "purple"] as const;
export type SiteThemeId = (typeof SITE_THEME_IDS)[number];

export const DEFAULT_SITE_THEME: SiteThemeId = "yellow";

export function isSiteThemeId(value: unknown): value is SiteThemeId {
  return typeof value === "string" && SITE_THEME_IDS.includes(value as SiteThemeId);
}

export function applySiteTheme(theme: SiteThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.siteTheme = theme;
  document.documentElement.classList.toggle("dark", theme !== "white");
  document.documentElement.classList.toggle("site-light", theme === "white");
}
