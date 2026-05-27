"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { ReviewItem } from "@/lib/reviews-data";

type Props = {
  initialReviews: ReviewItem[];
};

export function Reviews({ initialReviews }: Props) {
  const t = useTranslations("reviews");
  const [reviews] = useState(initialReviews);
  const [index, setIndex] = useState(0);
  const current = reviews[index];

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section id="reviews" className="section-pad px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-5 md:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">{t("subtitle")}</p>
        </ScrollReveal>

        {reviews.length === 0 ? (
          <p className="text-center text-zinc-500">—</p>
        ) : (
          <div className="relative">
            <div
              key={current?.id ?? index}
              className="glass rounded-2xl p-6 md:p-12 text-center neon-border"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full overflow-hidden ring-2 ring-yellow-500/50">
                {current?.avatarUrl?.trim() ? (
                  <Image
                    src={current.avatarUrl.trim()}
                    alt={current.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-xl md:text-2xl font-bold">
                    {current?.name[0]}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-1 mb-3 md:mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (current?.rating ?? 5) ? "fill-amber-400 text-amber-400" : "text-zinc-600"}`}
                  />
                ))}
              </div>
              <h3 className="text-lg md:text-xl font-semibold">{current?.name}</h3>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                {current?.text}
              </p>
            </div>

            {reviews.length > 1 && (
              <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
                  className="p-2.5 rounded-lg glass hover:neon-border text-yellow-400 touch-manipulation"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all touch-manipulation ${
                        i === index ? "bg-yellow-500 w-6" : "bg-zinc-600 w-2"
                      }`}
                      aria-label={`Review ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % reviews.length)}
                  className="p-2.5 rounded-lg glass hover:neon-border text-yellow-400 touch-manipulation"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
