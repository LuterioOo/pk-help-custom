"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";
import { ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function isHomePath(pathname: string, base: string) {
  return pathname === base || pathname === `${base}/` || pathname === "/";
}

export function MobileStickyCta() {
  const t = useTranslations("hero");
  const base = useLocaleBase();
  const pathname = usePathname() ?? "";
  const { locked: buildLocked } = useTradeInReady();
  const [builderInView, setBuilderInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById("builder");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBuilderInView(entry.isIntersecting && entry.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.5] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  if (!isHomePath(pathname, base)) return null;

  const builderHref = buildLocked ? `${base}/trade-in` : `${base}#builder`;

  if (builderInView) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 pointer-events-none"
      aria-hidden={false}
    >
      <div className="pointer-events-auto max-w-lg mx-auto glass-strong rounded-xl border border-yellow-500/20 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] p-1 grid grid-cols-[1.4fr_1fr_1fr] gap-1">
        <Link
          href={builderHref}
          className={cn(
            "flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold min-h-[40px]",
            "bg-gradient-to-r from-yellow-300 to-amber-500 text-black",
            "shadow-[0_4px_16px_rgba(255,215,0,0.35)] active:scale-[0.98] transition-transform"
          )}
        >
          {buildLocked ? t("ctaBuildLocked") : t("ctaBuild")}
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
        <Link
          href={`${base}/trade-in`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium text-yellow-400/95 bg-white/[0.04] border border-white/10 active:scale-[0.98] transition-transform"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t("ctaTradeInPage")}
        </Link>
        <Link
          href={`${base}#contacts`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium text-zinc-300 bg-white/[0.04] border border-white/10 active:scale-[0.98] transition-transform"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {t("ctaContact")}
        </Link>
      </div>
    </div>
  );
}
