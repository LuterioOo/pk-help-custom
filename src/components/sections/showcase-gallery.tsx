"use client";

import { ShowcaseImage } from "@/components/ui/showcase-image";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { ShowcaseItem } from "@/lib/showcase-data";

type Props = {
  initialItems: ShowcaseItem[];
};

export function ShowcaseGallery({ initialItems }: Props) {
  const t = useTranslations("showcase");

  if (initialItems.length === 0) return null;

  return (
    <section id="showcase" className="section-pad px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-zinc-400 max-w-2xl mx-auto">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {initialItems.map((item, i) => (
            <ScrollReveal key={item.id} delay={Math.min(i * 0.04, 0.2)}>
              <article className="group relative overflow-hidden rounded-2xl glass neon-border aspect-[4/3] transition-transform duration-300 hover:-translate-y-1">
                <ShowcaseImage
                  src={item.imageUrl}
                  alt={item.title ?? "PC build"}
                  className="transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {item.showText && (item.title || item.caption) ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-5">
                    {item.title ? (
                      <h3 className="font-semibold text-base md:text-lg text-yellow-400">{item.title}</h3>
                    ) : null}
                    {item.caption ? (
                      <p className="text-xs md:text-sm text-zinc-300 mt-1 line-clamp-2">{item.caption}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="absolute inset-0 ring-1 ring-inset ring-yellow-500/10 group-hover:ring-yellow-500/25 transition-all" />
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
