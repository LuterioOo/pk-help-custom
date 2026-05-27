"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function TradeInGuide() {
  const t = useTranslations("tradeInGuide");
  const base = useLocaleBase();

  return (
    <section id="trade-in-guide" className="section-pad px-4 md:px-8 pt-0">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="glass-strong rounded-2xl p-6 md:p-8 neon-border gradient-mesh">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold neon-text">{t("title")}</h2>
                <div className="mt-3 space-y-2 text-zinc-300">
                  <p className="text-sm leading-relaxed">{t("step1")}</p>
                  <p className="text-sm leading-relaxed">{t("step2")}</p>
                  <p className="text-sm leading-relaxed">{t("step3")}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={`${base}/trade-in`}>{t("ctaTradeIn")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={`${base}#builder`}>{t("ctaBuilder")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

