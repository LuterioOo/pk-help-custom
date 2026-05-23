"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string;
  imageUrl: string;
  title?: string | null;
  caption?: string | null;
  showText: boolean;
  pricePLN?: number | null;
};

export function BuildsForSale() {
  const t = useTranslations("forSale");
  const locale = useLocale();
  const [items, setItems] = useState<Item[]>([]);
  const base = locale === "ru" || locale === "pl" ? "" : `/${locale}`;

  useEffect(() => {
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((d) => setItems(d.forSale ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="shop" className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.06}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="relative overflow-hidden rounded-2xl glass neon-border"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title ?? "PC"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black">
                    {t("badge")}
                  </span>
                  {item.pricePLN != null && item.pricePLN > 0 ? (
                    <span className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-bold bg-black/80 text-yellow-400 border border-yellow-500/40">
                      {formatPrice(item.pricePLN, locale)}
                    </span>
                  ) : null}
                </div>
                <div className="p-5 space-y-3">
                  {item.title ? (
                    <h3 className="font-semibold text-lg text-yellow-400">{item.title}</h3>
                  ) : null}
                  {item.showText && item.caption ? (
                    <p className="text-sm text-zinc-400">{item.caption}</p>
                  ) : null}
                  <Link href={`${base}#order`}>
                    <Button size="sm" className="w-full">{t("cta")}</Button>
                  </Link>
                </div>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}