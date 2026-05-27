"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  className?: string;
};

export function HeroVisual({ className }: Props) {
  const t = useTranslations("heroVisual");
  return (
    <div className={cn("relative w-full h-full", className)} aria-hidden>
      {/* Ambient premium glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/14 via-amber-500/8 to-transparent blur-2xl md:blur-3xl" />
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_70%_35%,rgba(255,215,0,0.20),transparent_48%),radial-gradient(circle_at_25%_75%,rgba(99,102,241,0.12),transparent_55%)]" />

      {/* Subtle workshop grid / toolbench feel (no icons) */}
      <div className="absolute inset-0 rounded-3xl opacity-[0.14] mix-blend-screen pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />

      {/* Realistic PC visual (from existing showcase uploads) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 glass-strong">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/55 pointer-events-none" />
        <Image
          src="/hero_premium_setup.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 520px, 70vw"
          className="object-contain object-center scale-[1.04] translate-y-1"
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_72%_55%,rgba(255,215,0,0.20),transparent_42%)]" />
      </div>

      {/* Floating “service” labels */}
      <div className="absolute right-3 top-4 sm:right-5 sm:top-6 animate-float">
        <div className="rounded-2xl glass border border-yellow-500/20 px-3 py-2 shadow-[0_0_46px_rgba(255,215,0,0.10)]">
          <div className="text-[11px] tracking-wider uppercase text-yellow-300/90">{t("workshopLabel")}</div>
          <div className="text-xs font-semibold text-zinc-100">{t("workshopTitle")}</div>
        </div>
      </div>

      <div className="absolute left-3 bottom-4 sm:left-5 sm:bottom-6 animate-float [animation-delay:240ms]">
        <div className="rounded-2xl glass border border-white/10 px-3 py-2 shadow-[0_0_40px_rgba(99,102,241,0.10)]">
          <div className="text-[11px] tracking-wider uppercase text-zinc-400">{t("tradeInLabel")}</div>
          <div className="text-xs font-semibold text-zinc-100">{t("tradeInTitle")}</div>
        </div>
      </div>
    </div>
  );
}
