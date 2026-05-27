"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";

type Props = {
  className?: string;
};

export function HeroVisual({ className }: Props) {
  const t = useTranslations("heroVisual");
  const [liveCount, setLiveCount] = useState(3);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = (await res.json()) as { count: number };
        if (typeof data.count === "number" && data.count > 0) {
          setLiveCount(data.count);
        }
      } catch {
        /* use default 3 */
      }
    };
    void fetchCount();
    const interval = setInterval(() => void fetchCount(), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative w-full h-full select-none", className)} aria-hidden>
      {/* Ambient premium yellow glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/15 via-amber-500/8 to-transparent blur-3xl" />
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_70%_35%,rgba(255,215,0,0.22),transparent_48%),radial-gradient(circle_at_25%_75%,rgba(99,102,241,0.12),transparent_55%)] animate-pulse-glow" />

      {/* Subtle workshop grid overlay */}
      <div className="absolute inset-0 rounded-3xl opacity-[0.12] mix-blend-screen pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Realistic PC workshop setup image */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 glass-strong shadow-[0_0_50px_rgba(255,215,0,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/50 pointer-events-none z-10" />
        <Image
          src="/hero_premium_setup.png"
          alt="PK HELP Custom premium setup"
          fill
          priority
          sizes="(min-width: 1024px) 600px, 90vw"
          className="object-cover object-center scale-[1.02] hover:scale-[1.05] transition-transform duration-700"
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_60%,rgba(255,215,0,0.18),transparent_45%)] z-10" />
      </div>

      {/* Floating “service” label - WORKSHOP */}
      <div className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 animate-float max-w-[42%]">
        <div className="rounded-xl glass-strong border border-yellow-500/30 px-2 py-1.5 shadow-[0_0_16px_rgba(255,215,0,0.1)]">
          <div className="text-[9px] tracking-wider font-semibold uppercase text-yellow-400">{t("workshopLabel")}</div>
          <div className="text-[11px] font-bold text-zinc-100 leading-tight break-words">{t("workshopTitle")}</div>
        </div>
      </div>

      {/* Floating “service” label - TRADE-IN */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 animate-float [animation-delay:350ms] max-w-[42%]">
        <div className="rounded-xl glass-strong border border-white/10 px-2 py-1.5 shadow-[0_0_16px_rgba(99,102,241,0.08)]">
          <div className="text-[9px] tracking-wider font-semibold uppercase text-zinc-400">{t("tradeInLabel")}</div>
          <div className="text-[11px] font-bold text-zinc-100 leading-tight break-words">{t("tradeInTitle")}</div>
        </div>
      </div>

      {/* Floating real-time orders notification widget */}
      <div className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 z-20 animate-pulse-glow">
        <div className="rounded-xl glass-strong border border-yellow-500/30 px-3 py-2 shadow-[0_0_16px_rgba(255,215,0,0.12)] flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-yellow-400 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full ring-2 ring-zinc-950" />
          </div>
          <div>
            <div className="text-[10px] tracking-wider uppercase text-zinc-500 font-semibold">{t("liveRequestsTitle")}</div>
            <div className="text-xs font-bold text-yellow-400">
              {t("liveRequestsDesc", { count: liveCount })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
