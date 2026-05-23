"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PcIllustration } from "@/components/sections/pc-illustration";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const base = locale === "ru" ? "" : `/${locale}`;

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <ScrollReveal>
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase glass text-yellow-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t("badge")}
          </motion.span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="neon-text">{t("title")}</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={`${base}#builder`}>
              <Button size="lg">{t("ctaBuild")}</Button>
            </Link>
            <Link href={`${base}#order`}>
              <Button size="lg" variant="outline">
                {t("ctaContact")}
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} direction="right" className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 blur-3xl" />
            <PcIllustration />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
