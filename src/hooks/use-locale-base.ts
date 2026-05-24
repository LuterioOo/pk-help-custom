"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { localeBasePath } from "@/lib/locale-path";

/** Hash/link prefix for current site (main RU/UK/EN or Polish-only). */
export function useLocaleBase(): string {
  const locale = useLocale();
  const pathname = usePathname();
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  return useMemo(
    () => (host ? localeBasePath(locale, host, pathname) : locale === "ru" ? "" : `/${locale}`),
    [host, locale, pathname]
  );
}
