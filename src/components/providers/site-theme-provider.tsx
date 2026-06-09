"use client";

import { useEffect } from "react";
import { applySiteTheme, DEFAULT_SITE_THEME, isSiteThemeId } from "@/lib/site-theme";

export function SiteThemeProvider() {
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/site-theme", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { theme?: string };
          if (isSiteThemeId(data.theme)) {
            applySiteTheme(data.theme);
            return;
          }
        }
      } catch {
        /* fallback */
      }
      applySiteTheme(DEFAULT_SITE_THEME);
    };
    void load();

    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent<{ theme?: string }>).detail?.theme;
      if (isSiteThemeId(detail)) applySiteTheme(detail);
    };
    window.addEventListener("pkhelp-theme-updated", onTheme);
    return () => window.removeEventListener("pkhelp-theme-updated", onTheme);
  }, []);

  return null;
}
