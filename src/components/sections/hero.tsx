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
  const { ready: buildReady } = useTradeInReady();

  return (
    <section id="hero" className="relative pt-[6rem] sm:pt-[6.3rem] pb-4 sm:pb-6 px-4 md:px-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,rgba(99,102,241,0.10),transparent_42%),radial-gradient(circle_at_15%_12%,rgba(255,215,0,0.10),transparent_34%)]" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_minmax(240px,40%)] gap-6 lg:gap-8 items-center">
          <ScrollReveal>
            <Badge variant="accent" className="mb-4 uppercase tracking-widest text-[10px]">
              {t("badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
              <span className="neon-text">{t("title")}</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>

            {/* 3 main CTAs — equal height row */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-3 w-full">
              {buildReady ? (
                <Button
                  asChild
                  size="xl"
                  className={cn(
                    "w-full sm:flex-[1.4] sm:min-w-0",
                    "shadow-[0_8px_40px_rgba(255,215,0,0.35)] hover:shadow-[0_12px_48px_rgba(255,215,0,0.45)]"
                  )}
                >
                  <Link href={`${base}#builder`} className="flex items-center justify-center gap-3">
                    {t("ctaBuild")}
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="xl"
                  variant="secondary"
                  className="w-full sm:flex-[1.4] sm:min-w-0 opacity-80"
                >
                  <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-3">
                    {t("ctaBuildLocked")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:flex-1 sm:min-h-[56px] sm:min-h-[64px] sm:text-base sm:rounded-2xl border-yellow-500/25 hover:border-yellow-500/50"
              >
                <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  {t("ctaTradeInPage")}
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:flex-1 sm:min-h-[56px] sm:min-h-[64px] sm:text-base sm:rounded-2xl"
              >
                <Link href={`${base}#contacts`} className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400/80" />
                  {t("ctaContact")}
                </Link>
              </Button>
            </div>

            {!buildReady ? (
              <p className="mt-3 text-xs text-zinc-500 max-w-md">{t("ctaBuildLockedHint")}</p>
            ) : null}

            <div className="mt-6 sm:mt-8">
              <HeroAdvantagesStrip />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="right" className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[min(100%,300px)] sm:max-w-sm lg:max-w-none aspect-[4/3] max-h-[min(42vh,200px)] sm:max-h-[240px] lg:max-h-[300px] mx-auto lg:mx-0">
              <HeroVisual />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
