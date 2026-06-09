"use client";

import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroVisual } from "@/components/sections/hero-visual";
import { HeroAdvantagesStrip } from "@/components/sections/hero-advantages-strip";
import { ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("hero");
  const base = useLocaleBase();
  const { locked: buildLocked } = useTradeInReady();

  return (
    <section
      id="hero"
      className="relative pt-[calc(2.75rem+env(safe-area-inset-top))] sm:pt-[5rem] md:pt-[6.25rem] pb-3 sm:pb-10 px-3 sm:px-4 md:px-8 min-h-0 sm:min-h-[min(88vh,820px)] md:min-h-[min(92vh,880px)] flex flex-col justify-start sm:justify-center"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_15%_12%,rgba(255,215,0,0.14),transparent_38%)]" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_minmax(260px,38%)] gap-4 sm:gap-8 lg:gap-12 items-center">
          <ScrollReveal>
            <Badge variant="accent" className="mb-2 sm:mb-5 uppercase tracking-widest text-[9px] sm:text-[10px]">
              {t("badge")}
            </Badge>
            <h1 className="text-[1.65rem] leading-[1.08] sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight sm:leading-[1.05]">
              <span className="neon-text">{t("title")}</span>
            </h1>
            <p className="mt-2 sm:mt-5 text-sm sm:text-lg text-zinc-400 max-w-xl leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
              {t("subtitle")}
            </p>

            <p className="mt-3 sm:mt-6 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium">
              {t("ctaGroupLabel")}
            </p>
            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              {buildLocked ? (
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full sm:flex-[1.5] sm:min-w-0 min-h-[48px] sm:min-h-[64px] text-base sm:text-xl font-bold opacity-90 border-dashed border-yellow-500/30"
                >
                  <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-2 sm:gap-3">
                    {t("ctaBuildLocked")}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full sm:flex-[1.5] sm:min-w-0 min-h-[48px] sm:min-h-[64px] text-base sm:text-xl font-bold",
                    "shadow-[0_8px_32px_rgba(255,215,0,0.35)] hover:shadow-[0_14px_56px_rgba(255,215,0,0.5)]"
                  )}
                >
                  <Link href={`${base}#builder`} className="flex items-center justify-center gap-2 sm:gap-3">
                    {t("ctaBuild")}
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Link>
                </Button>
              )}

              <Button
                asChild
                size="md"
                variant="secondary"
                className="w-full sm:flex-1 sm:min-h-[60px] sm:text-base sm:rounded-2xl border-yellow-500/35 hover:border-yellow-500/55 bg-yellow-500/8 min-h-[44px]"
              >
                <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  {t("ctaTradeInPage")}
                </Link>
              </Button>

              <Button
                asChild
                size="md"
                variant="outline"
                className="w-full sm:flex-1 sm:min-h-[60px] sm:text-base sm:rounded-2xl border-white/15 min-h-[44px]"
              >
                <Link href={`${base}#contacts`} className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400/80" />
                  {t("ctaContact")}
                </Link>
              </Button>
            </div>

            {buildLocked ? (
              <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-zinc-500 max-w-md">{t("ctaBuildLockedHint")}</p>
            ) : null}

            <div className="hidden sm:block mt-6 sm:mt-8">
              <HeroAdvantagesStrip />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="right" className="relative hidden sm:flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[min(100%,340px)] sm:max-w-md lg:max-w-none aspect-[4/3] max-h-[min(40vh,220px)] sm:max-h-[280px] lg:max-h-[360px] mx-auto lg:mx-0">
              <HeroVisual />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
