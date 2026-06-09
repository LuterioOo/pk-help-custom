"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type Locale } from "@/i18n/routing";
import { getLocalesForSite } from "@/lib/locale-path";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  ru: "RU",
  uk: "UA",
  en: "EN",
  pl: "PL",
};

type Variant = "default" | "floating" | "compact";

export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: Variant;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const availableLocales = useMemo(() => {
    if (!mounted) return [];
    return [...getLocalesForSite(window.location.hostname, pathname)] as Locale[];
  }, [mounted, pathname]);

  if (availableLocales.length <= 1) return null;

  const switchLocale = (next: Locale) => {
    const segments = pathname.split("/");
    const hasLocale = availableLocales.includes(segments[1] as Locale);
    if (hasLocale) segments[1] = next;
    else segments.splice(1, 0, next);
    const newPath = segments.join("/") || `/${next}`;
    router.replace(newPath);
  };

  return (
    <div
      className={cn(
        "flex gap-0.5 rounded-lg",
        variant === "floating"
          ? "p-1 glass-strong border border-[var(--theme-border)]"
          : variant === "compact"
            ? "p-0.5 glass"
            : "p-0.5 glass",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {availableLocales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={cn(
            "font-semibold rounded-md transition-colors touch-manipulation tap-scale",
            variant === "floating"
              ? "px-2.5 py-1.5 text-[11px] min-h-[36px] min-w-[38px]"
              : "px-2 py-0.5 text-[11px] min-h-[30px] min-w-[34px]",
            locale === l
              ? "bg-[var(--theme-accent)] text-[var(--theme-text-on-accent)] shadow-sm"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
