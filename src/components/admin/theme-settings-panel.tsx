"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  applySiteTheme,
  DEFAULT_SITE_THEME,
  isSiteThemeId,
  SITE_THEME_IDS,
  type SiteThemeId,
} from "@/lib/site-theme";
import { cn } from "@/lib/utils";

const SWATCH: Record<SiteThemeId, string> = {
  yellow: "linear-gradient(135deg,#fde047,#f59e0b)",
  black: "linear-gradient(135deg,#52525b,#18181b)",
  white: "linear-gradient(135deg,#fafafa,#e4e4e7)",
  purple: "linear-gradient(135deg,#c084fc,#7c3aed)",
};

export function ThemeSettingsPanel() {
  const t = useTranslations("admin.theme");
  const [theme, setTheme] = useState<SiteThemeId>(DEFAULT_SITE_THEME);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-theme")
      .then((r) => r.json())
      .then((d: { theme?: string }) => {
        if (isSiteThemeId(d.theme)) setTheme(d.theme);
      })
      .catch(() => {});
  }, []);

  const save = async (next: SiteThemeId) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setTheme(next);
      applySiteTheme(next);
      window.dispatchEvent(new CustomEvent("pkhelp-theme-updated", { detail: { theme: next } }));
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{t("title")}</h2>
        <p className="text-sm text-zinc-500 mt-1">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SITE_THEME_IDS.map((id) => (
          <button
            key={id}
            type="button"
            disabled={saving}
            onClick={() => void save(id)}
            className={cn(
              "tap-scale rounded-xl border p-3 text-left transition-colors touch-manipulation",
              theme === id
                ? "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)]"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <span
              className="block h-10 rounded-lg mb-2 border border-white/10"
              style={{ background: SWATCH[id] }}
            />
            <span className="text-sm font-medium text-zinc-200">{t(id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
