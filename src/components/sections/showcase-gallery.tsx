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
    <section id="showcase" className="section-pad-tight px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-2xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-zinc-400 max-w-xl">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {initialItems.map((item, i) => (
            <ScrollReveal key={item.id} delay={Math.min(i * 0.04, 0.2)}>
              <article className="group relative overflow-hidden rounded-xl glass neon-border aspect-[4/3] transition-transform duration-300 hover:-translate-y-0.5">
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
