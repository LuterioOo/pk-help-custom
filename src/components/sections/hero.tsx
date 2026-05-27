"use client";

import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroVisual } from "@/components/sections/hero-visual";
import { HeroAdvantagesStrip } from "@/components/sections/hero-advantages-strip";
import { ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { useUiSound } from "@/hooks/use-ui-sound";
import { cn } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("hero");
  const base = useLocaleBase();
  const { playTone } = useUiSound();
  const { ready: buildReady } = useTradeInReady();

  return (
    <section id="hero" className="relative pt-[5.1rem] sm:pt-[5.4rem] pb-2 sm:pb-3 px-4 md:px-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,rgba(99,102,241,0.10),transparent_42%),radial-gradient(circle_at_15%_12%,rgba(255,215,0,0.10),transparent_34%)]" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_minmax(240px,40%)] gap-4 lg:gap-6 items-center">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium tracking-wider uppercase glass text-yellow-300 mb-3">
              {t("badge")}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12]">
              <span className="neon-text">{t("title")}</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2.5">
              {buildReady ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto shadow-[0_4px_20px_rgba(255,215,0,0.22)]"
                  onClick={() => playTone("click")}
                >
                  <Link href={`${base}#builder`} className="flex items-center justify-center gap-2">
                    {t("ctaBuild")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  disabled
                  className={cn(
                    "w-full sm:w-auto cursor-not-allowed opacity-70",
                    "bg-zinc-700/80 text-zinc-400 border border-white/10",
                    "hover:bg-zinc-700/80 hover:scale-100 shadow-none"
                  )}
                  title={t("ctaBuildLockedHint")}
                >
                  {t("ctaBuildLocked")}
                </Button>
              )}

              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-yellow-500/30" onClick={() => playTone("click")}>
                <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  {t("ctaTradeInPage")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => playTone("click")}>
                <Link href={`${base}#order`} className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400" />
                  {t("ctaContact")}
                </Link>
              </Button>
            </div>

            {!buildReady ? (
              <p className="mt-3 text-xs text-amber-300/90 max-w-md">{t("ctaBuildLockedHint")}</p>
            ) : null}

            <div className="mt-4 sm:mt-5">
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
