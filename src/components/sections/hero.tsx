"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PcIllustration } from "@/components/sections/pc-illustration";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const base = locale === "ru" || locale === "pl" ? "" : `/${locale}`;

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] sm:min-h-screen flex items-center pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 md:px-8"
    >
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
            <Link href={`${base}#builder`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                {t("ctaBuild")}
              </Button>
            </Link>
            <Link href={`${base}#order`} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t("ctaContact")}
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} direction="right" className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-lg aspect-square">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/15 to-amber-500/5 blur-2xl md:blur-3xl" />
            <PcIllustration />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
