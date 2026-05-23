"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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

export function Advantages() {
  const t = useTranslations("advantages");

  return (
    <section id="advantages" className="py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <ScrollReveal key={key} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-2xl glass h-full hover:neon-border transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                    {t(`items.${key}.desc`)}
                  </p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
