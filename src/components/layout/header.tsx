"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
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
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-strong rounded-2xl px-4 md:px-6 py-3">
        <Logo href={base || "/"} size="sm" />

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`${base}#builder`}>
            <Button size="sm">{t("builder")}</Button>
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-zinc-300"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden mt-2 mx-4 glass-strong rounded-2xl p-4"
          >
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
              <LanguageSwitcher />
              <Link href={`${base}#builder`} onClick={() => setOpen(false)}>
                <Button className="w-full">{t("builder")}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
