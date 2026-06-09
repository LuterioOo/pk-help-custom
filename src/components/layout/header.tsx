"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import Link from "next/link";
import { Menu, Volume2, VolumeX, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";
import { useUiSound } from "@/hooks/use-ui-sound";

const navIds = ["home", "shop", "masters", "tradeIn", "builder", "advantages", "reviews", "contact"] as const;
const hrefMap: Record<(typeof navIds)[number], string> = {
  home: "#hero",
  shop: "#shop",
  masters: "#masters",
  tradeIn: "#trade-in",
  builder: "#builder",
  advantages: "#advantages",
  reviews: "#reviews",
  contact: "#contacts",
};

export function Header() {
  const t = useTranslations("nav");
  const base = useLocaleBase();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { muted, toggleMute, playTone } = useUiSound();

  const isHome = pathname === `${base}` || pathname === `${base}/` || pathname === "/";
  const builderHref = isHome ? `${base}#builder` : `${base || "/"}/#builder`;

  const links = navIds.map((id) => {
    const rawHref = hrefMap[id];
    let href = rawHref;
    if (rawHref.startsWith("#")) {
      if (!isHome) {
        href = (base || "/") + rawHref;
      }
    } else {
      href = `${base}${rawHref}`;
    }
    return {
      id,
      label: t(id),
      href,
    };
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-1.5 sm:px-4 md:px-8 py-1 sm:py-2 md:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 glass-strong rounded-lg sm:rounded-xl md:rounded-2xl px-2 sm:px-3.5 md:px-6 py-1 sm:py-2 md:py-2.5 min-h-[40px] sm:min-h-[48px]">
        <Logo href={base || "/"} size="xs" className="sm:hidden shrink-0" />
        <Logo href={base || "/"} size="sm" className="hidden sm:block xl:hidden" />
        <Logo href={base || "/"} size="lg" className="hidden xl:block" />

        <nav className="hidden xl:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => playTone("click")}
              className="px-3 xl:px-4 py-2 text-[13px] whitespace-nowrap text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 border border-transparent hover:border-yellow-500/25"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2 lg:gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => {
              toggleMute();
              playTone("click");
            }}
            className="p-2 rounded-lg glass text-zinc-300 cursor-pointer"
            aria-label={muted ? "Unmute UI sounds" : "Mute UI sounds"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Button asChild size="sm" onClick={() => playTone("click")}>
            <Link href={builderHref}>{t("builder")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 xl:hidden ml-auto">
          <Link
            href={builderHref}
            onClick={() => playTone("click")}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold",
              "bg-gradient-to-r from-yellow-300 to-amber-500 text-black",
              "shadow-[0_2px_12px_rgba(255,215,0,0.3)] active:scale-[0.97] transition-transform touch-manipulation"
            )}
          >
            {t("builder")}
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            className="p-2 text-zinc-300 touch-manipulation"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "xl:hidden mt-1.5 mx-2 sm:mx-4 glass-strong rounded-xl overflow-hidden transition-all duration-200 origin-top",
          open ? "opacity-100 max-h-[85vh] visible" : "opacity-0 max-h-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-0.5 p-2.5 max-h-[70vh] overflow-y-auto overscroll-contain">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => {
                setOpen(false);
                playTone("click");
              }}
              className="px-3 py-2.5 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 touch-manipulation"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-2.5 pt-0 border-t border-white/10 flex flex-col gap-2">
          <LanguageSwitcher className="w-full justify-center" />
          <Button
            asChild
            className="w-full"
            onClick={() => {
              setOpen(false);
              playTone("click");
            }}
          >
            <Link href={builderHref}>{t("builder")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
