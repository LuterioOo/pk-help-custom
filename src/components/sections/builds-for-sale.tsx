"use client";

import { ShowcaseImage } from "@/components/ui/showcase-image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useLocale } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { ShowcaseItem } from "@/lib/showcase-data";
import { RefreshCw, CreditCard } from "lucide-react";

type Props = {
  initialItems: ShowcaseItem[];
  featured?: boolean;
};

export function BuildsForSale({ initialItems, featured = false }: Props) {
  const t = useTranslations("forSale");
  const locale = useLocale();
  const base = useLocaleBase();

  if (initialItems.length === 0) return null;

  const items = featured ? initialItems.slice(0, 3) : initialItems;
  const sectionClass = featured ? "section-pad-tight" : "section-pad";

  return (
    <section id="shop" className={`${sectionClass} px-4 md:px-8`}>
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-2 sm:mb-2.5">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold neon-text">{t("title")}</h2>
            <p className="mt-0.5 text-[11px] sm:text-xs text-zinc-400 max-w-xl">{t("subtitle")}</p>
          </div>
        </ScrollReveal>

        <div className={`grid gap-2 sm:gap-3 ${featured ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {items.map((item, i) => {
            const monthly =
              item.pricePLN != null && item.pricePLN > 0 ? Math.max(1, Math.round(item.pricePLN / 12)) : null;

            return (
              <ScrollReveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
                <article className="relative overflow-hidden rounded-xl glass neon-border transition-transform duration-300 hover:-translate-y-0.5 h-full flex flex-col">
                  <div className={`relative ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                    <ShowcaseImage
                      src={item.imageUrl}
                      alt={item.title ?? "PC"}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-black">
                      {t("badge")}
                    </span>
                    {item.pricePLN != null && item.pricePLN > 0 ? (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-black/85 text-yellow-400 border border-yellow-500/40">
                        {formatPrice(item.pricePLN, locale)}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                    {item.title ? (
                      <h3 className="font-semibold text-sm sm:text-base text-yellow-400 line-clamp-1">{item.title}</h3>
                    ) : null}
                    {item.showText && item.caption ? (
                      <p className="text-xs text-zinc-400 line-clamp-2 flex-1">{item.caption}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {monthly != null ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-zinc-400">
                          <CreditCard className="w-3 h-3 text-yellow-400/80" />
                          {t("installment", { amount: monthly })}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-yellow-400/90 border border-yellow-500/20">
                        <RefreshCw className="w-3 h-3" />
                        {t("tradeInApply")}
                      </span>
                    </div>
                    <Button asChild size="sm" className="w-full h-9 mt-auto">
                      <Link href={`${base}#order`}>{t("cta")}</Link>
                    </Button>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
