"use client";

import { ShowcaseImage } from "@/components/ui/showcase-image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { ShowcaseItem } from "@/lib/showcase-data";

type Props = {
  initialItems: ShowcaseItem[];
};

export function BuildsForSale({ initialItems }: Props) {
  const t = useTranslations("forSale");
  const locale = useLocale();
  const base = locale === "ru" || locale === "pl" ? "" : `/${locale}`;

  if (initialItems.length === 0) return null;

  return (
    <section id="shop" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {initialItems.map((item, i) => (
            <ScrollReveal key={item.id} delay={Math.min(i * 0.05, 0.25)}>
              <article className="relative overflow-hidden rounded-2xl glass neon-border transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-[4/3]">
                  <ShowcaseImage
                    src={item.imageUrl}
                    alt={item.title ?? "PC"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold bg-yellow-400 text-black">
                    {t("badge")}
                  </span>
                  {item.pricePLN != null && item.pricePLN > 0 ? (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs md:text-sm font-bold bg-black/80 text-yellow-400 border border-yellow-500/40">
                      {formatPrice(item.pricePLN, locale)}
                    </span>
                  ) : null}
                </div>
                <div className="p-4 md:p-5 space-y-3">
                  {item.title ? (
                    <h3 className="font-semibold text-base md:text-lg text-yellow-400">{item.title}</h3>
                  ) : null}
                  {item.showText && item.caption ? (
                    <p className="text-sm text-zinc-400 line-clamp-2">{item.caption}</p>
                  ) : null}
                  <Link href={`${base}#order`}>
                    <Button size="sm" className="w-full">
                      {t("cta")}
                    </Button>
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
