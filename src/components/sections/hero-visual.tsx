"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function HeroVisual({ className }: Props) {
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

    </div>
  );
}
