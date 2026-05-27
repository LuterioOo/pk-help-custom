"use client";

import { useTranslations } from "next-intl";
import {
  User,
  ShieldCheck,
  BadgeCheck,
  Zap,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const icons = [User, ShieldCheck, BadgeCheck, Zap, Headphones, MessageCircle];
const keys = ["individual", "compatibility", "warranty", "speed", "support", "consult"] as const;

type Props = {
  compact?: boolean;
};

export function Advantages({ compact = false }: Props) {
  const t = useTranslations("advantages");

  if (compact) {
    return (
      <section id="advantages" className="section-pad-tight px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-2 sm:mb-2.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold neon-text">{t("title")}</h2>
              <p className="mt-0.5 text-[11px] sm:text-xs text-zinc-500 max-w-lg">{t("subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
            {keys.map((key, i) => {
              const Icon = icons[i];
              return (
                <ScrollReveal key={key} delay={i * 0.04}>
                  <div className="group h-full p-3 rounded-xl glass border border-white/5 hover:border-yellow-500/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/25 to-amber-500/10 flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-100 leading-tight">{t(`items.${key}.title`)}</h3>
                    <p className="mt-1 text-[10px] text-zinc-500 leading-snug line-clamp-2">{t(`items.${key}.desc`)}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="advantages-full" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <ScrollReveal key={key} delay={i * 0.06}>
                <div className="group p-5 rounded-2xl glass h-full hover:neon-border transition-shadow duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100">{t(`items.${key}.title`)}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{t(`items.${key}.desc`)}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
