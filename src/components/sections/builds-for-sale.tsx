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
    <section id="shop" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const monthly =
              item.pricePLN != null && item.pricePLN > 0 ? Math.max(1, Math.round(item.pricePLN / 12)) : null;

            return (
              <ScrollReveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
                <article className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/8 transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col">
                  <div className="relative aspect-[16/10]">
                    <ShowcaseImage
                      src={item.imageUrl}
                      alt={item.title ?? "PC"}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <Badge variant="accent" className="absolute top-3 left-3 font-bold uppercase">
                      {t("badge")}
                    </Badge>
                    {item.pricePLN != null && item.pricePLN > 0 ? (
                      <Badge variant="price" className="absolute top-3 right-3 text-sm font-bold px-2.5 py-1">
                        {formatPrice(item.pricePLN, locale)}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
                    {item.title ? (
                      <h3 className="font-semibold text-base sm:text-lg text-zinc-100 line-clamp-1">{item.title}</h3>
                    ) : null}
                    {item.showText && item.caption ? (
                      <p className="text-sm text-zinc-500 line-clamp-2 flex-1">{item.caption}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {monthly != null ? (
                        <Badge variant="muted" icon={<CreditCard className="w-3 h-3 text-yellow-400/70" />}>
                          {t("installment", { amount: monthly })}
                        </Badge>
                      ) : null}
                      <Badge variant="accent" icon={<RefreshCw className="w-3 h-3" />}>
                        {t("tradeInApply")}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <Button
                        className="w-full"
                        isLoading={loadingId === item.id}
                        onClick={() => void customizeBuild(item)}
                      >
                        <Settings2 className="w-4 h-4 mr-1" />
                        {t("customize")}
                      </Button>
                      <p className="text-[10px] text-zinc-600 text-center">{t("customizeDesc")}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`${base}#order`} className="flex items-center justify-center gap-2">
                          {t("cta")}
                          <ArrowRight className="w-4 h-4" />
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
