"use client";

import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroVisual } from "@/components/sections/hero-visual";

export function Hero() {
  const t = useTranslations("hero");
  const base = useLocaleBase();

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] sm:min-h-screen flex items-center pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 md:px-8"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,rgba(99,102,241,0.12),transparent_42%),radial-gradient(circle_at_15%_12%,rgba(255,215,0,0.12),transparent_34%)]" />
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <ScrollReveal>
          <span className="inline-block px-3 py-1.5 sm:px-4 rounded-full text-[10px] sm:text-xs font-medium tracking-wider uppercase glass text-yellow-300 mb-4 sm:mb-6">
            {t("badge")}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.12]">
            <span className="neon-text">{t("title")}</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`${base}#builder`} className="w-full sm:w-auto">
                {t("ctaBuild")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href={`${base}#order`} className="w-full sm:w-auto">
                {t("ctaContact")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href={`${base}/trade-in`} className="w-full sm:w-auto">
                {t("ctaTradeIn")}
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} direction="right" className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-lg aspect-square">
            <HeroVisual />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
