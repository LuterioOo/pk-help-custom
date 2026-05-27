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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {items.map(({ key, Icon }) => (
        <div
          key={key}
          className="flex items-center gap-2.5 rounded-xl glass border border-white/5 px-3 py-2.5"
        >
          <div className="p-2 rounded-lg bg-yellow-500/10 shrink-0">
            <Icon className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wide font-semibold leading-tight">
            {t(`features.${key}`)}
          </p>
        </div>
      ))}
    </div>
  );
}
