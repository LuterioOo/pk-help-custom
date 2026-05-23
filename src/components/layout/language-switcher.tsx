"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { type Locale } from "@/i18n/routing";
import { getLocalesForHost, mainLocales } from "@/lib/site";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  ru: "RU",
  uk: "UA",
  en: "EN",
  pl: "PL",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const availableLocales = useMemo(() => {
    if (typeof window === "undefined") return [...mainLocales];
    return [...getLocalesForHost(window.location.hostname)] as Locale[];
  }, []);

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
    <div className={cn("flex gap-1 p-1 rounded-lg glass", className)}>
      {availableLocales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            locale === l
              ? "bg-yellow-500/80 text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
