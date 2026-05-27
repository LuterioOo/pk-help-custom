"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Ticket, ArrowRight } from "lucide-react";

export function TradeInGuide() {
  const t = useTranslations("tradeInGuide");
  const base = useLocaleBase();
  const { ready, couponAmount } = useTradeInReady();

  return (
    <section id="trade-in-guide" className="section-pad-tight px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="glass-strong rounded-2xl p-4 md:p-6 neon-border gradient-mesh">
            <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-bold neon-text">{t("title")}</h2>
                <div className="mt-2 space-y-1.5 text-zinc-300">
                  <p className="text-sm leading-relaxed">{t("step1")}</p>
                  <p className="text-sm leading-relaxed hidden sm:block">{t("step2")}</p>
                  <p className="text-sm leading-relaxed hidden md:block">{t("step3")}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="md">
                    <Link href={`${base}/trade-in`} className="flex items-center gap-2">
                      {t("ctaEstimate")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="md" variant="outline">
                    <Link href={`${base}#builder`}>{t("ctaBuilder")}</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Ticket className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{t("couponPreviewTitle")}</span>
                </div>
                {ready && couponAmount > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-emerald-300">{couponAmount} PLN</p>
                    <p className="text-xs text-zinc-500">{t("couponPreviewActive")}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-zinc-400">{t("couponPreviewEmpty")}</p>
                    <p className="text-[11px] text-zinc-600">{t("couponPreviewHint")}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
