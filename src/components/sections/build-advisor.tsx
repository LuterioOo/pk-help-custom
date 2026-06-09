"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ComponentCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { scrollToBuilderParts } from "@/lib/scroll-to-builder";
import { useBuild } from "@/store/build-store";
import {
  groupComponentsByCategory,
  recommendBuild,
  type UseCase,
} from "@/lib/build-advisor";
import type { ComponentSpec } from "@/lib/compatibility";
import { Gamepad2, Radio, Briefcase, Palette, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const USE_CASES: { id: UseCase; Icon: typeof Gamepad2 }[] = [
  { id: "gaming", Icon: Gamepad2 },
  { id: "streaming", Icon: Radio },
  { id: "work", Icon: Briefcase },
  { id: "creative", Icon: Palette },
];

const BUDGET_MIN = 2500;
const BUDGET_MAX = 15000;
const BUDGET_STEP = 250;

const CORE_CATEGORIES: ComponentCategory[] = [
  "CPU",
  "GPU",
  "RAM",
  "SSD",
];

export function BuildAdvisor() {
  const t = useTranslations("advisor");
  const locale = useLocale();
  const { applyPreset } = useBuild();

  const [useCase, setUseCase] = useState<UseCase>("gaming");
  const [budget, setBudget] = useState(4500);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    total: number;
    components: ComponentSpec[];
    withinBudget: boolean;
  } | null>(null);

  const budgetLabel = useMemo(() => formatPrice(budget, locale), [budget, locale]);

  const runAdvisor = useCallback(async () => {
    setLoading(true);
    setPreview(null);
    try {
      const res = await fetch("/api/components");
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
        toast.error(t("errorEmpty"));
        return;
      }

      const grouped = groupComponentsByCategory(rows);
      const result = recommendBuild(budget, useCase, grouped);
      const components = Object.values(result.selection).filter(Boolean) as ComponentSpec[];

      if (components.length < 4) {
        toast.error(t("errorNoMatch"));
        return;
      }

      setPreview({
        total: result.total,
        components,
        withinBudget: result.withinBudget,
      });
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }, [budget, useCase, t]);

  const loadIntoBuilder = useCallback(() => {
    if (!preview) return;
    applyPreset(preview.components);
    toast.success(t("loaded"));
    requestAnimationFrame(() => scrollToBuilderParts("smooth"));
  }, [preview, applyPreset, t]);

  const highlightComponents = preview
    ? CORE_CATEGORIES.map((cat) => preview.components.find((c) => c.category === cat)).filter(Boolean)
    : [];

  return (
      <div className="mb-4 sm:mb-6 rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-4 sm:p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 100% 0%, rgba(255,215,0,0.12), transparent 55%)",
          }}
        />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <Badge variant="accent" icon={<Sparkles className="w-3 h-3" />} className="mb-2 uppercase tracking-wider">
                {t("badge")}
              </Badge>
              <h3 className="text-base sm:text-xl font-bold text-zinc-100">{t("title")}</h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-lg">{t("subtitle")}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            {USE_CASES.map(({ id, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setUseCase(id);
                  setPreview(null);
                }}
                className={cn(
                  "tap-scale flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all min-h-[52px]",
                  useCase === id
                    ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
                    : "border-white/8 bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg shrink-0",
                    useCase === id ? "bg-yellow-500/20" : "bg-white/[0.04]"
                  )}
                >
                  <Icon className={cn("w-4 h-4", useCase === id ? "text-yellow-400" : "text-zinc-500")} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t(`useCases.${id}.title`)}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{t(`useCases.${id}.desc`)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/8 bg-black/20 p-4 mb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <label htmlFor="advisor-budget" className="text-sm font-medium text-zinc-300">
                {t("budgetLabel")}
              </label>
              <span className="text-lg sm:text-xl font-bold neon-text tabular-nums">{budgetLabel}</span>
            </div>
            <input
              id="advisor-budget"
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={budget}
              onChange={(e) => {
                setBudget(Number(e.target.value));
                setPreview(null);
              }}
              className="w-full accent-theme h-2 cursor-pointer"
            />
            <div className="flex justify-between mt-1.5 text-[11px] text-zinc-600 tabular-nums">
              <span>{formatPrice(BUDGET_MIN, locale)}</span>
              <span>{formatPrice(BUDGET_MAX, locale)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              onClick={() => void runAdvisor()}
              isLoading={loading}
              className="sm:min-w-[200px] min-h-[44px] shadow-[0_4px_20px_rgba(255,215,0,0.2)]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("cta")}
            </Button>
            {preview ? (
              <Button variant="outline" onClick={loadIntoBuilder} className="min-h-[44px]">
                {t("loadBuilder")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>

          {preview ? (
            <div className="mt-4 pt-4 border-t border-white/8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <p className="text-sm text-zinc-400">{t("resultLabel")}</p>
                <span className="text-xl font-bold neon-text tabular-nums">{formatPrice(preview.total, locale)}</span>
                {!preview.withinBudget ? (
                  <Badge variant="muted">{t("overBudget")}</Badge>
                ) : (
                  <Badge variant="accent">{t("withinBudget")}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {highlightComponents.map((c) =>
                  c ? (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] border border-white/6 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{c.category}</p>
                        <p className="text-sm text-zinc-200 truncate">{c.name}</p>
                      </div>
                      <span className="text-sm font-medium text-yellow-400/90 tabular-nums shrink-0">
                        {formatPrice(c.price, locale)}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
              <p className="mt-2 text-[11px] text-zinc-600">{t("resultHint")}</p>
            </div>
          ) : null}
        </div>
      </div>
  );
}
