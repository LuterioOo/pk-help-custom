"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import Link from "next/link";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";
import { useUiSound } from "@/hooks/use-ui-sound";

const navIds = ["home", "tradeIn", "showcase", "shop", "builder", "advantages", "reviews", "contact", "order"] as const;
const hrefMap: Record<(typeof navIds)[number], string> = {
  home: "#hero",
  tradeIn: "#trade-in",
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
  const base = useLocaleBase();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { muted, toggleMute, playTone } = useUiSound();

  const isHome = pathname === `${base}` || pathname === `${base}/` || pathname === "/";

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
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-strong rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
        <Logo href={base || "/"} size="lg" />

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
          <Button
            asChild
            size="sm"
            onClick={() => playTone("click")}
          >
            <Link href={isHome ? `${base}#builder` : `${base || "/"}/#builder`}>{t("builder")}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="xl:hidden p-2.5 text-zinc-300 touch-manipulation -mr-1"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "xl:hidden mt-2 mx-3 sm:mx-4 glass-strong rounded-2xl overflow-hidden transition-all duration-200 origin-top",
          open ? "opacity-100 max-h-[85vh] visible" : "opacity-0 max-h-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-0.5 p-3 max-h-[70vh] overflow-y-auto overscroll-contain">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => {
                setOpen(false);
                playTone("click");
              }}
              className="px-4 py-3 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 touch-manipulation"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 pt-0 border-t border-white/10 flex flex-col gap-3">
          <LanguageSwitcher className="w-full justify-center" />
          <Button
            asChild
            className="w-full"
            onClick={() => {
              setOpen(false);
              playTone("click");
            }}
          >
            <Link href={isHome ? `${base}#builder` : `${base || "/"}/#builder`}>
              {t("builder")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
