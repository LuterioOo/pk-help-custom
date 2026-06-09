"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import Link from "next/link";
import { Menu, Volume2, VolumeX, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
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

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const links = navIds.map((id) => {
    const rawHref = hrefMap[id];
    let href = rawHref;
    if (rawHref.startsWith("#")) {
      if (!isHome) href = (base || "/") + rawHref;
    } else {
      href = `${base}${rawHref}`;
    }
    return { id, label: t(id), href };
  });

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="xl:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]"
          onClick={closeMenu}
        />
      ) : null}

      <header className="fixed top-0 left-0 right-0 z-50 px-1 sm:px-4 md:px-8 pt-[max(0.125rem,env(safe-area-inset-top))] pb-0 sm:py-2 md:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 glass-strong rounded-md sm:rounded-xl md:rounded-2xl px-1.5 sm:px-3.5 md:px-6 py-0 sm:py-2 md:py-2.5 min-h-[32px] sm:min-h-[48px]">
          <Logo href={base || "/"} size="xs" className="sm:hidden shrink-0 -ml-0.5 brightness-110" />
          <Logo href={base || "/"} size="sm" className="hidden sm:block xl:hidden" />
          <Logo href={base || "/"} size="lg" className="hidden xl:block" />

          <nav className="hidden xl:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => playTone("click")}
                className="px-3 xl:px-4 py-2 text-[13px] whitespace-nowrap text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 border border-transparent hover:border-[var(--theme-border)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-2 lg:gap-3">
            <button
              type="button"
              onClick={() => {
                toggleMute();
                playTone("click");
              }}
              className="p-2 rounded-lg glass text-zinc-300 cursor-pointer tap-scale"
              aria-label={muted ? "Unmute UI sounds" : "Mute UI sounds"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Button asChild size="sm" onClick={() => playTone("click")}>
              <Link href={builderHref}>{t("builder")}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-0.5 xl:hidden ml-auto shrink-0">
            <Link
              href={builderHref}
              onClick={() => playTone("click")}
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-none btn-theme-primary",
                "tap-scale touch-manipulation min-h-[28px]"
              )}
            >
              {t("builder")}
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center min-w-[38px] min-h-[38px] rounded-md tap-scale touch-manipulation",
                "text-theme bg-theme-soft border border-theme"
              )}
              onClick={() => {
                setOpen(!open);
                playTone("click");
              }}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={20} strokeWidth={2.25} /> : <Menu size={20} strokeWidth={2.25} />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "xl:hidden relative z-50 mt-0.5 mx-1 sm:mx-4 glass-strong rounded-lg border border-theme overflow-hidden transition-[opacity,transform,max-height] duration-200 ease-out origin-top motion-reduce:transition-none",
            open
              ? "opacity-100 max-h-[min(68vh,480px)] visible translate-y-0 menu-slide-in"
              : "opacity-0 max-h-0 invisible pointer-events-none -translate-y-0.5"
          )}
        >
          <nav className="flex flex-col py-0.5 max-h-[min(45vh,340px)] overflow-y-auto overscroll-contain">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => {
                  closeMenu();
                  playTone("click");
                }}
                className="px-3 py-1.5 text-[13px] text-zinc-300 hover:text-white rounded-md hover:bg-white/5 touch-manipulation tap-scale"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-2 py-1.5 border-t border-white/10 space-y-1.5">
            <div className="flex justify-center">
              <LanguageSwitcher variant="compact" />
            </div>
            <Button
              asChild
              size="sm"
              className="w-full min-h-[34px]"
              onClick={() => {
                closeMenu();
                playTone("click");
              }}
            >
              <Link href={builderHref}>{t("builder")}</Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
