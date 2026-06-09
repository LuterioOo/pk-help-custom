"use client";

import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroVisual } from "@/components/sections/hero-visual";
import { HeroAdvantagesStrip } from "@/components/sections/hero-advantages-strip";
import { ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function HeroImageFrame({ className, banner }: { className?: string; banner?: boolean }) {
  return (
    <div className={cn("relative w-full", className)}>
      {banner ? (
        <div
          className="absolute -inset-4 sm:-inset-6 pointer-events-none rounded-3xl opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.28), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(99,102,241,0.15), transparent 60%)",
            filter: "blur(24px)",
          }}
        />
      ) : null}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl",
          banner
            ? "aspect-[16/9] border border-yellow-500/25 shadow-[0_12px_56px_rgba(255,215,0,0.18),0_4px_24px_rgba(0,0,0,0.4)]"
            : "aspect-[4/3] max-h-[360px] border border-white/10"
        )}
      >
        <HeroVisual />
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const base = useLocaleBase();

  return (
    <section
      id="hero"
      className="relative pt-[calc(2.25rem+env(safe-area-inset-top))] sm:pt-[5rem] md:pt-[6.25rem] pb-3 sm:pb-10 px-4 md:px-8 min-h-0 sm:min-h-[min(88vh,820px)] md:min-h-[min(92vh,880px)] flex flex-col justify-start sm:justify-center"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_15%_12%,rgba(255,215,0,0.14),transparent_38%)]" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_minmax(260px,38%)] gap-6 sm:gap-8 lg:gap-12 items-center">
          <div>
            <Badge
              variant="accent"
              className="hero-enter mb-2.5 sm:mb-5 uppercase tracking-widest text-[10px] sm:text-[10px]"
            >
              {t("badge")}
            </Badge>
            <h1 className="hero-enter hero-enter-delay-1 hero-title sm:text-5xl lg:text-6xl xl:text-7xl font-bold sm:leading-[1.05] sm:tracking-tight max-w-[18ch] sm:max-w-none">
              <span className="neon-text">{t("title")}</span>
            </h1>
            <p className="hero-enter hero-enter-delay-2 mt-3 sm:mt-5 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Mobile: full-width banner directly under headline */}
            <ScrollReveal delay={0.08} className="lg:hidden mt-5 mb-1 w-full">
              <HeroImageFrame banner />
            </ScrollReveal>

            <p className="hero-enter hero-enter-delay-3 mt-5 sm:mt-6 text-[10px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium">
              {t("ctaGroupLabel")}
            </p>
            <div className="hero-enter hero-enter-delay-3 mt-2.5 sm:mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <Button
                asChild
                size="md"
                className={cn(
                  "tap-scale w-full sm:flex-[1.5] sm:min-w-0 min-h-[44px] sm:min-h-[64px] text-sm sm:text-xl font-bold",
                  "shadow-[0_6px_24px_rgba(255,215,0,0.28)] sm:shadow-[0_8px_32px_rgba(255,215,0,0.35)]"
                )}
              >
                <Link href={`${base}#builder`} className="flex items-center justify-center gap-2 sm:gap-3">
                  {t("ctaBuild")}
                  <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant="secondary"
                className="tap-scale w-full sm:flex-1 sm:min-h-[60px] sm:text-base sm:rounded-2xl border-yellow-500/35 hover:border-yellow-500/55 bg-yellow-500/8 min-h-[42px] text-sm"
              >
                <Link href={`${base}/trade-in`} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  {t("ctaTradeInPage")}
                </Link>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="tap-scale w-full sm:flex-1 sm:min-h-[60px] sm:text-base sm:rounded-2xl border-white/15 min-h-[42px] text-sm"
                onClick={() => window.dispatchEvent(new Event("pkhelp-open-support"))}
              >
                <MessageSquare className="w-4 h-4 text-yellow-400/80" />
                {t("ctaContact")}
              </Button>
            </div>

            <div className="mt-4 sm:mt-8">
              <HeroAdvantagesStrip />
            </div>
          </div>

          {/* Desktop: hero visual in right column */}
          <ScrollReveal delay={0.1} direction="right" className="relative hidden lg:flex justify-end">
            <HeroImageFrame className="max-w-none" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
