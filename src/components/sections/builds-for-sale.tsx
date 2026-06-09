"use client";

import { ShowcaseImage } from "@/components/ui/showcase-image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { useLocale } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { ShowcaseItem } from "@/lib/showcase-data";
import { RefreshCw, CreditCard, ArrowRight, Settings2 } from "lucide-react";
import { useBuild } from "@/store/build-store";
import type { ComponentCategory } from "@prisma/client";
import type { ComponentSpec } from "@/lib/compatibility";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  initialItems: ShowcaseItem[];
  featured?: boolean;
};

const genericSaleTitles: Record<string, string> = {
  ru: "Готовая сборка",
  uk: "Готова збірка",
  en: "Ready PC",
  pl: "Gotowy PC",
};

const genericSaleCaptions: Record<string, string> = {
  ru: "ПК готов к заказу",
  uk: "ПК готовий до замовлення",
  en: "Ready to order",
  pl: "Gotowy do zamówienia",
};

function isGenericAdminTitle(value: string | null) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "pc" || normalized === "gotowy pc" || normalized.includes("sprzeda");
}

export function BuildsForSale({ initialItems, featured = false }: Props) {
  const t = useTranslations("forSale");
  const locale = useLocale();
  const base = useLocaleBase();
  const { applyPreset } = useBuild();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (initialItems.length === 0) return null;

  const items = featured ? initialItems.slice(0, 3) : initialItems;

  const customizeBuild = async (item: ShowcaseItem) => {
    const preset = item.presetComponents;
    if (!preset || Object.keys(preset).length === 0) {
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      toast.info(t("customizeNoPreset"));
      return;
    }
    setLoadingId(item.id);
    try {
      const ids = Object.values(preset).filter(Boolean);
      const res = await fetch(`/api/components?ids=${encodeURIComponent(ids.join(","))}`);
      const data = (await res.json()) as {
        components?: Array<{
          id: string;
          name: string;
          category: ComponentCategory;
          price: number;
          baseMarketPricePLN?: number;
          markupPLN?: number;
          specs: Record<string, unknown>;
        }>;
      };
      const rows = data.components ?? [];
      if (rows.length === 0) {
        toast.error(t("customizeError"));
        return;
      }
      const specs: ComponentSpec[] = rows.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        price: c.price,
        baseMarketPricePLN: c.baseMarketPricePLN ?? Math.max(0, c.price - (c.markupPLN ?? 0)),
        markupPLN: c.markupPLN ?? 0,
        specs: c.specs ?? {},
      }));
      applyPreset(specs);
      toast.success(t("customizeLoaded"));
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      toast.error(t("customizeError"));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section id="shop" className="section-pad px-3 sm:px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-3 sm:mb-8">
          <h2 className="text-lg sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-zinc-400 max-w-2xl">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-2.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const monthly =
              item.pricePLN != null && item.pricePLN > 0 ? Math.max(1, Math.round(item.pricePLN / 12)) : null;
            const displayTitle = isGenericAdminTitle(item.title)
              ? `${genericSaleTitles[locale] ?? genericSaleTitles.ru} #${i + 1}`
              : item.title;
            const displayCaption = item.showText
              ? isGenericAdminTitle(item.caption)
                ? genericSaleCaptions[locale] || genericSaleCaptions.ru
                : item.caption
              : null;

            return (
              <ScrollReveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
                <article className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/8 transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col card-hover-lift">
                  <div className="relative aspect-[16/10] max-h-[148px] sm:max-h-none">
                    <ShowcaseImage
                      src={item.imageUrl}
                      alt={displayTitle ?? "PC"}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <Badge variant="accent" className="absolute top-2 left-2 text-[9px] sm:text-xs font-bold uppercase px-1.5 py-0">
                      {t("badge")}
                    </Badge>
                    {item.pricePLN != null && item.pricePLN > 0 ? (
                      <Badge variant="price" className="absolute top-2 right-2 text-xs sm:text-sm font-bold px-2 py-0.5">
                        {formatPrice(item.pricePLN, locale)}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="p-2.5 sm:p-5 flex flex-col flex-1 gap-1.5 sm:gap-3">
                    {displayTitle ? (
                      <h3 className="font-semibold text-xs sm:text-lg text-zinc-100 line-clamp-1">{displayTitle}</h3>
                    ) : null}
                    {displayCaption ? (
                      <p className="text-[11px] sm:text-sm text-zinc-500 line-clamp-2 flex-1">{displayCaption}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5">
                      {monthly != null ? (
                        <Badge variant="muted" icon={<CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400/70" />}>
                          <span className="text-[10px] sm:text-xs">{t("installment", { amount: monthly })}</span>
                        </Badge>
                      ) : null}
                      <Badge variant="accent" icon={<RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}>
                        <span className="text-[10px] sm:text-xs">{t("tradeInApply")}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 mt-auto">
                      <Button
                        size="sm"
                        className="w-full min-h-[32px] sm:min-h-[44px] text-[11px] sm:text-sm shadow-[0_4px_16px_rgba(255,215,0,0.15)]"
                        isLoading={loadingId === item.id}
                        onClick={() => void customizeBuild(item)}
                      >
                        <Settings2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        {t("customize")}
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full min-h-[30px] sm:min-h-[40px] text-[11px] sm:text-sm">
                        <Link href={`${base}#order`} className="flex items-center justify-center gap-1.5">
                          {t("cta")}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
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
