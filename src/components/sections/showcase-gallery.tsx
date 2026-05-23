"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type Item = {
  id: string;
  imageUrl: string;
  title?: string | null;
  caption?: string | null;
  showText: boolean;
};

export function ShowcaseGallery() {
  const t = useTranslations("showcase");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="showcase" className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.05}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative overflow-hidden rounded-2xl glass neon-border aspect-[4/3]"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title ?? "PC build"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {item.showText && (item.title || item.caption) ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                    {item.title ? (
                      <h3 className="font-semibold text-lg text-yellow-400">{item.title}</h3>
                    ) : null}
                    {item.caption ? (
                      <p className="text-sm text-zinc-300 mt-1">{item.caption}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="absolute inset-0 ring-1 ring-inset ring-yellow-500/10 group-hover:ring-yellow-500/25 transition-all" />
                )}
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}