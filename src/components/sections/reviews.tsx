"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  text: string;
}

export function Reviews() {
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const current = reviews[index];

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section id="reviews" className="py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-4 text-zinc-400">{t("subtitle")}</p>
        </ScrollReveal>

        {loading ? (
          <div className="glass rounded-2xl p-8">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-zinc-500">—</p>
        ) : (
          <div className="relative">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5 }}
                  className="glass rounded-2xl p-8 md:p-12 text-center neon-border"
                >
                  <div className="relative w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden ring-2 ring-yellow-500/50">
                    {current.avatarUrl?.trim() ? (
                      <Image
                        src={current.avatarUrl.trim()}
                        alt={current.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-2xl font-bold">
                        {current.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < current.rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"}`}
                      />
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold">{current.name}</h3>
                  <p className="mt-4 text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                    {current.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {reviews.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
                  className="p-2 rounded-lg glass hover:neon-border text-yellow-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === index ? "bg-yellow-500 w-6" : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setIndex((i) => (i + 1) % reviews.length)}
                  className="p-2 rounded-lg glass hover:neon-border text-yellow-400"
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
