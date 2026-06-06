"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredImage } from "@/components/ui/stored-image";
import { formatPrice } from "@/lib/utils";
import type { MasterItem } from "@/lib/masters-data";
import { User, ArrowRight, Star } from "lucide-react";

type Props = {
  initialMasters: MasterItem[];
};

export function MasterBuilds({ initialMasters }: Props) {
  const t = useTranslations("masters");
  const locale = useLocale();
  const base = useLocaleBase();

  if (initialMasters.length === 0) return null;

  return (
    <section id="masters" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="space-y-8 sm:space-y-10">
          {initialMasters.map((master, mi) => (
            <ScrollReveal key={master.id} delay={mi * 0.05}>
              <article className="glass rounded-2xl p-4 sm:p-6 border border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-5 sm:mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-yellow-500/20">
                      {master.avatarUrl ? (
                        <StoredImage src={master.avatarUrl} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-100">{master.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {master.specialization ? (
                          <Badge variant="accent">{master.specialization}</Badge>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400/90">
                          <Star className="w-3.5 h-3.5 fill-yellow-500/30" />
                          {t("rating", { value: master.rating.toFixed(1) })}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {t("buildsCount", { count: master.buildsCount })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {master.description ? (
                    <p className="text-sm text-zinc-500 sm:ml-auto sm:max-w-md">{master.description}</p>
                  ) : null}
                </div>

                {master.builds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {master.builds.map((build) => (
                      <div
                        key={build.id}
                        className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col"
                      >
                        {build.imageUrl ? (
                          <div className="relative aspect-video bg-black/40">
                            <StoredImage src={build.imageUrl} />
                            {build.pricePLN != null && build.pricePLN > 0 ? (
                              <Badge variant="price" className="absolute top-2 right-2 text-xs font-bold px-2 py-1">
                                {formatPrice(build.pricePLN, locale)}
                              </Badge>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                          <h4 className="font-semibold text-sm text-yellow-400/95">{build.title}</h4>
                          {build.description ? (
                            <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{build.description}</p>
                          ) : null}
                          <div className="flex gap-2 mt-auto pt-2">
                            <Button asChild size="sm" className="flex-1">
                              <Link href={`${base}#order`}>{t("orderBuild")}</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
                              <Link href={`${base}#order`}>
                                {t("details")}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">{t("noBuilds")}</p>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
