"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Cpu, RefreshCw, CreditCard, FileText } from "lucide-react";
import { useTradeInReady } from "@/hooks/use-trade-in-ready";
import { cn } from "@/lib/utils";

const items = [
  { key: "build" as const, icon: Cpu, href: "#builder", primary: true, requiresCoupon: true },
  { key: "tradeIn" as const, icon: RefreshCw, href: "/trade-in", primary: false, requiresCoupon: false },
  { key: "installment" as const, icon: CreditCard, href: "#order", primary: false, requiresCoupon: false },
  { key: "order" as const, icon: FileText, href: "#order", primary: false, requiresCoupon: false },
];

export function HomeCtaStrip() {
  const t = useTranslations("homeCta");
  const base = useLocaleBase();
  const { ready: buildReady } = useTradeInReady();

  return (
    <section className="section-pad-tight px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            {items.map(({ key, icon: Icon, href, primary, requiresCoupon }) => {
              const locked = requiresCoupon && !buildReady;
              const path = locked
                ? `${base}/trade-in`
                : href.startsWith("#")
                  ? `${base}${href}`
                  : `${base}${href}`;
              return (
                <Link
                  key={key}
                  href={path}
                  className={cn(
                    "group flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl p-3.5 sm:p-4 transition-all duration-200",
                    locked ? "opacity-60 cursor-pointer" : "hover:-translate-y-0.5",
                    primary && !locked
                      ? "glass-strong neon-border bg-yellow-500/12 hover:bg-yellow-500/18 shadow-[0_8px_26px_rgba(255,215,0,0.2)]"
                      : "glass border border-white/10 hover:border-yellow-500/30 hover:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={`shrink-0 p-2 rounded-lg ${
                      primary ? "bg-yellow-500/25" : "bg-white/5 group-hover:bg-yellow-500/15"
                    } transition-colors`}
                  >
                    <Icon className={`w-4 h-4 ${primary ? "text-yellow-300" : "text-yellow-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-zinc-100 leading-tight">
                      {locked ? t("buildLocked") : t(key)}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 line-clamp-2">
                      {locked ? t("buildLockedDesc") : t(`${key}Desc`)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
