"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const navIds = ["home", "showcase", "shop", "builder", "advantages", "reviews", "contact", "order"] as const;
const hrefMap: Record<(typeof navIds)[number], string> = {
  home: "#hero",
  showcase: "#showcase",
  shop: "#shop",
  builder: "#builder",
  advantages: "#advantages",
  reviews: "#reviews",
  contact: "#contacts",
  order: "#order",
};

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const base = locale === "ru" || locale === "pl" ? "" : `/${locale}`;

  const links = navIds.map((id) => ({
    id,
    label: t(id),
    href: `${base}${hrefMap[id]}`,
  }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-strong rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
        <Logo href={base || "/"} size="sm" />

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="px-3 xl:px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <LanguageSwitcher />
          <Link href={`${base}#builder`}>
            <Button size="sm">{t("builder")}</Button>
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2.5 text-zinc-300 touch-manipulation -mr-1"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden mt-2 mx-3 sm:mx-4 glass-strong rounded-2xl overflow-hidden transition-all duration-200 origin-top",
          open ? "opacity-100 max-h-[85vh] visible" : "opacity-0 max-h-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-0.5 p-3 max-h-[70vh] overflow-y-auto overscroll-contain">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 touch-manipulation"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 pt-0 border-t border-white/10 flex flex-col gap-3">
          <LanguageSwitcher className="w-full justify-center" />
          <Link href={`${base}#builder`} onClick={() => setOpen(false)}>
            <Button className="w-full">{t("builder")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
