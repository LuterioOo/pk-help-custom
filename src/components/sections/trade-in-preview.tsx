"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { RefreshCw, Ticket, CreditCard, ArrowRight } from "lucide-react";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";

export function TradeInPreview() {
  const t = useTranslations("tradeInPreview");
  const base = useLocaleBase();
  const { ready, couponAmount } = useTradeInReady();

  return (
    <section id="trade-in" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-stretch rounded-2xl bg-white/[0.02] border border-white/8 gradient-mesh p-5 sm:p-6 md:p-8">
            <div className="min-w-0">
              <Badge variant="accent" icon={<RefreshCw className="w-3 h-3" />} className="mb-3 uppercase tracking-wider">
                {t("badge")}
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold neon-text leading-tight">{t("title")}</h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">{t("desc")}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="muted" icon={<Ticket className="w-3 h-3 text-yellow-400/70" />}>
                  {t("stepCoupon")}
                </Badge>
                <Badge variant="muted" icon={<CreditCard className="w-3 h-3 text-yellow-400/70" />}>
                  {t("installment")}
                </Badge>
              </div>
              <div className="mt-5">
                <Button asChild size="lg">
                  <Link href={`${base}/trade-in`} className="flex items-center gap-2">
                    {t("cta")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[280px] sm:max-w-[300px] rounded-2xl overflow-hidden border border-yellow-500/25 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5"
                aria-hidden
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,rgba(255,215,0,0.35),transparent_50%)]" />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/70 font-semibold">PK-HELP</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{t("couponLabel")}</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold text-yellow-400 tabular-nums">
                    {ready && couponAmount > 0 ? `${couponAmount} PLN` : t("couponAmount")}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {ready ? t("couponActive") : t("couponSample")}
                  </p>
                  <div className="mt-3 pt-3 border-t border-dashed border-yellow-500/15">
                    <p className="text-[10px] text-zinc-600 leading-snug">{t("couponNote")}</p>
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
