"use client";

import { useTranslations } from "next-intl";
import { Cpu, Wrench, Shield, Truck } from "lucide-react";

const items = [
  { key: "hardware" as const, Icon: Cpu },
  { key: "assembly" as const, Icon: Wrench },
  { key: "warranty" as const, Icon: Shield },
  { key: "delivery" as const, Icon: Truck },
];

export function HeroAdvantagesStrip() {
  const t = useTranslations("hero");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3">
      {items.map(({ key, Icon }) => (
        <div
          key={key}
          role="presentation"
          aria-hidden
          className="flex items-center gap-2 rounded-lg bg-white/[0.035] border border-white/[0.05] px-2.5 py-2 sm:gap-2.5 sm:bg-white/[0.02] sm:border-transparent sm:px-3 sm:py-2.5 pointer-events-none select-none"
        >
          <div className="p-1.5 rounded-md bg-yellow-500/10 shrink-0">
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400/75" />
          </div>
          <p className="text-[9px] sm:text-xs text-zinc-400 sm:text-zinc-500 uppercase tracking-wide leading-tight">
            {t(`features.${key}`)}
          </p>
        </div>
      ))}
    </div>
  );
}
