"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { RefreshCw, Ticket, CreditCard } from "lucide-react";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";

export function TradeInPreview() {
  const t = useTranslations("tradeInPreview");
  const base = useLocaleBase();
  const { ready, couponAmount } = useTradeInReady();

  return (
    <section id="trade-in" className="section-pad-tight px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid lg:grid-cols-[1fr_auto] gap-3 lg:gap-5 items-stretch rounded-2xl glass-strong neon-border gradient-mesh p-3 sm:p-4 md:p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                  <RefreshCw className="w-3 h-3" />
                  {t("badge")}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold neon-text leading-tight">{t("title")}</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">{t("desc")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                  <Ticket className="w-3 h-3 text-yellow-400" />
                  {t("stepCoupon")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                  <CreditCard className="w-3 h-3 text-yellow-400" />
                  {t("installment")}
                </span>
              </div>
              <div className="mt-4">
                <Button asChild size="md" className="h-10">
                  <Link href={`${base}/trade-in`}>{t("cta")}</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[280px] sm:max-w-[300px] rounded-2xl overflow-hidden border border-yellow-500/40 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 shadow-[0_8px_32px_rgba(255,215,0,0.12)]"
                aria-hidden
              >
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(255,215,0,0.35),transparent_50%)]" />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/80 font-semibold">PK-HELP</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{t("couponLabel")}</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold text-yellow-400 tabular-nums">
                    {ready && couponAmount > 0 ? `${couponAmount} PLN` : t("couponAmount")}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {ready ? t("couponActive") : t("couponSample")}
                  </p>
                  <div className="mt-3 pt-3 border-t border-dashed border-yellow-500/25">
                    <p className="text-[10px] text-zinc-500 leading-snug">{t("couponNote")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
