"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ComponentCategory } from "@prisma/client";
import { ComponentImage } from "@/components/ui/component-image";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  AlertTriangle,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  CreditCard,
  Ticket,
  Lock,
} from "lucide-react";
import { useBuild } from "@/store/build-store";
import type { ComponentSpec } from "@/lib/compatibility";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BuildAdvisor } from "@/components/sections/build-advisor";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBuilderIssue } from "@/lib/format-builder-issue";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUiSound } from "@/hooks/use-ui-sound";
import {
  BUILDER_CATEGORY_ORDER,
  canAccessCategory,
  getNextCategory,
  isCategoryLocked,
} from "@/lib/builder-flow";
type SortKey = "price-asc" | "price-desc" | "name";

interface ApiComponent {
  id: string;
  category: ComponentCategory;
  name: string;
  brand: string;
  price: number;
  baseMarketPricePLN?: number;
  markupPLN?: number;
  imageUrl: string | null;
  specs: Record<string, unknown>;
}

function CategoryChip({
  cat,
  isActive,
  locked,
  selected,
  label,
  onClick,
  compact,
}: {
  cat: ComponentCategory;
  isActive: boolean;
  locked: boolean;
  selected: boolean;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      data-category={cat}
      onClick={onClick}
      aria-disabled={locked}
      className={cn(
        "flex-shrink-0 text-left transition-all duration-200 flex items-center gap-1 touch-manipulation",
        compact
          ? "px-2 py-1 rounded-md text-[10px] min-h-[28px] whitespace-nowrap"
          : "xl:w-full px-3 py-3 rounded-xl text-sm min-h-[40px] xl:justify-between xl:gap-2 xl:whitespace-normal",
        isActive
          ? "bg-theme-soft text-theme font-medium border border-theme"
          : locked
            ? "text-zinc-600 bg-white/[0.01] border border-transparent cursor-not-allowed opacity-60"
            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent cursor-pointer tap-scale",
        selected && !isActive && !locked && "border-emerald-500/20"
      )}
    >
      <span className="truncate">{label}</span>
      {locked ? (
        <Lock className={cn("text-zinc-600 flex-shrink-0", compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />
      ) : selected ? (
        <Check className={cn("text-emerald-400 flex-shrink-0", compact ? "w-2.5 h-2.5" : "w-4 h-4")} />
      ) : (
        <span
          className={cn(
            "rounded-full bg-zinc-700 flex-shrink-0",
            compact ? "w-1 h-1" : "w-1.5 h-1.5"
          )}
        />
      )}
    </button>
  );
}

export function PcBuilder() {
  const t = useTranslations("builder");
  const locale = useLocale();
  const {
    selection,
    activeCategory,
    issues,
    total,
    tradeInCoupon,
    useTradeInCoupon,
    totalAfterTradeIn,
    installmentMonthly,
    installmentsRequested,
    selectComponent,
    setActiveCategory,
    clearBuild,
    saveToStorage,
    setUseTradeInCoupon,
    setInstallmentsRequested,
    isBuildComplete,
    missingCategories,
  } = useBuild();
  const [components, setComponents] = useState<ApiComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const mobileCategoryNavRef = useRef<HTMLElement>(null);
  const desktopCategoryNavRef = useRef<HTMLElement>(null);
  const componentsRef = useRef<HTMLDivElement>(null);
  const { playTone } = useUiSound();

  const scrollCategoryIntoView = useCallback((cat: ComponentCategory) => {
    const root = mobileCategoryNavRef.current ?? desktopCategoryNavRef.current;
    const btn = root?.querySelector(`[data-category="${cat}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/components?category=${activeCategory}`);
      const data = await res.json();
      setComponents(data.components ?? []);
    } catch {
      setComponents([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchComponents();
    setSearch("");
    setBrandFilter("all");
  }, [fetchComponents]);

  const brands = useMemo(() => {
    const set = new Set(components.map((c) => c.brand));
    return ["all", ...Array.from(set)];
  }, [components]);

  const filtered = useMemo(() => {
    let list = [...components];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q)
      );
    }
    if (brandFilter !== "all") list = list.filter((c) => c.brand === brandFilter);
    list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [components, search, brandFilter, sort]);

  const selectedCount = Object.keys(selection).length;
  const displayTotal = useTradeInCoupon && tradeInCoupon > 0 ? totalAfterTradeIn : total;
  const stepIndex = BUILDER_CATEGORY_ORDER.indexOf(activeCategory);
  const stepLabel = t(`categories.${activeCategory}`);

  const handleCategoryClick = (cat: ComponentCategory) => {
    if (!canAccessCategory(cat, selection)) {
      toast.info(t("selectPrevious"));
      return;
    }
    setActiveCategory(cat);
    scrollCategoryIntoView(cat);
  };

  const handleSelect = (c: ApiComponent) => {
    playTone("click");
    const spec: ComponentSpec = {
      id: c.id,
      name: c.name,
      category: c.category,
      price: c.price,
      baseMarketPricePLN: c.baseMarketPricePLN ?? Math.max(0, c.price - (c.markupPLN ?? 0)),
      markupPLN: c.markupPLN ?? 0,
      specs: c.specs,
    };
    const current = selection[c.category];
    if (current?.id === c.id) {
      selectComponent(c.category, null);
      return;
    }
    selectComponent(c.category, spec);
    const nextSelection = { ...selection, [c.category]: spec };
    const next = getNextCategory(c.category, nextSelection);
    if (next) {
      window.setTimeout(() => {
        setActiveCategory(next);
        scrollCategoryIntoView(next);
      }, 120);
    }
  };

  const handleSave = () => {
    if (!isBuildComplete) {
      toast.error(t("completeBuildFirst"));
      return;
    }
    saveToStorage();
    toast.success(t("save"));
  };

  const scrollToOrder = () => {
    if (!isBuildComplete) {
      toast.error(t("completeBuildFirst"));
      return;
    }
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const orderDisabled = !isBuildComplete || issues.some((i) => i.level === "error");

  const renderCategoryChips = (compact: boolean) =>
    BUILDER_CATEGORY_ORDER.map((cat) => (
      <CategoryChip
        key={cat}
        cat={cat}
        isActive={activeCategory === cat}
        locked={isCategoryLocked(cat, selection)}
        selected={Boolean(selection[cat])}
        label={t(`categories.${cat}`)}
        onClick={() => handleCategoryClick(cat)}
        compact={compact}
      />
    ));

  return (
    <section
      id="builder"
      className="section-pad !pt-2 sm:!pt-4 px-3 sm:px-4 md:px-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] xl:pb-8 scroll-mt-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-2 sm:mb-6">
          <h2 className="text-lg sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-0.5 sm:mt-2 text-[11px] sm:text-base text-zinc-400 max-w-2xl">{t("subtitle")}</p>
        </div>

        <BuildAdvisor />

        {/* Mobile: single compact sticky bar — summary + stepper */}
        <div className="xl:hidden sticky top-[calc(var(--mobile-header-height)+env(safe-area-inset-top))] z-[25] -mx-3 px-3 mb-2 pb-1.5 bg-[var(--theme-bg)]/92 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold neon-text tabular-nums leading-tight truncate">
                {formatPrice(displayTotal, locale)}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {t("stepOf", { current: stepIndex + 1, total: BUILDER_CATEGORY_ORDER.length })} · {stepLabel}
              </p>
            </div>
            <Button
              size="sm"
              onClick={scrollToOrder}
              disabled={orderDisabled}
              className="min-h-[34px] px-2.5 text-[11px] shrink-0"
            >
              {orderDisabled ? t("orderDisabled") : t("orderRequest")}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <nav
            ref={mobileCategoryNavRef}
            className="flex gap-0.5 overflow-x-auto scrollbar-hide py-0.5 -mx-0.5 px-0.5"
            aria-label={t("categoriesLabel")}
          >
            {renderCategoryChips(true)}
          </nav>
          {missingCategories.length > 0 ? (
            <div className="mt-1 pt-1 border-t border-white/5">
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mb-0.5">
                {t("missingParts")}
              </p>
              <p className="text-[10px] text-amber-300/90 line-clamp-2">
                {missingCategories.map((cat) => t(`categories.${cat}`)).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_320px] gap-2 md:gap-5">
          {/* Categories — desktop sidebar only */}
          <ScrollReveal className="hidden xl:block xl:sticky xl:top-28 xl:self-start order-1">
            <nav
              ref={desktopCategoryNavRef}
              className="rounded-2xl bg-white/[0.02] border border-white/5 p-2 flex flex-col gap-1"
            >
              {renderCategoryChips(false)}
            </nav>
          </ScrollReveal>

          {/* Components — center */}
          <div ref={componentsRef} className="space-y-2.5 sm:space-y-4 order-2 xl:order-2 min-w-0">
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search")}
                  className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/8 text-xs sm:text-sm focus:outline-none focus:ring-2 ring-theme focus:border-theme"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/8 text-xs sm:text-sm text-zinc-300 cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === "all" ? t("brandAll") : b}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/8 text-xs sm:text-sm text-zinc-300 cursor-pointer"
              >
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 sm:h-44 rounded-xl sm:rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-zinc-500 py-12 sm:py-16 text-sm">{t("noResults")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {filtered.map((c) => {
                  const isSelected = selection[c.category]?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={cn(
                        "tap-scale text-left transition-all touch-manipulation cursor-pointer group",
                        "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl",
                        "bg-white/[0.02] border hover:border-theme hover:bg-white/[0.04]",
                        isSelected
                          ? "border-theme bg-theme-soft ring-1 ring-theme"
                          : "border-white/8"
                      )}
                    >
                      <div className="flex gap-2.5 sm:gap-4 items-center">
                        <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden bg-black/30">
                          <ComponentImage
                            src={c.imageUrl}
                            alt={c.name}
                            category={c.category}
                            sizes="96px"
                          />
                          {isSelected ? (
                            <div className="absolute inset-0 bg-theme-soft flex items-center justify-center">
                              <Check className="w-4 h-4 sm:w-6 sm:h-6 text-theme" />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="accent" className="mb-0.5 text-[9px] sm:text-xs px-1.5 py-0">
                            {c.brand}
                          </Badge>
                          <p className="font-medium text-xs sm:text-base text-zinc-100 line-clamp-2 leading-snug">
                            {c.name}
                          </p>
                          <p className="mt-0.5 sm:mt-1.5 text-sm sm:text-lg font-bold text-theme tabular-nums">
                            {formatPrice(c.price, locale)}
                          </p>
                          <SpecsList specs={c.specs} />
                        </div>
                        <span
                          className={cn(
                            "shrink-0 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium",
                            isSelected
                              ? "bg-theme-soft text-theme border border-theme"
                              : "bg-white/[0.04] text-zinc-400 border border-white/10 group-hover:border-theme/40"
                          )}
                        >
                          {isSelected ? t("selected") : t("select")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary — desktop sidebar */}
          <ScrollReveal delay={0.1} className="xl:sticky xl:top-28 xl:self-start order-3 hidden xl:block">
            <div className="rounded-2xl bg-white/[0.03] border border-theme p-5 sm:p-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{t("summaryTitle")}</p>
                <p className="text-3xl sm:text-4xl font-bold neon-text tabular-nums">
                  {formatPrice(displayTotal, locale)}
                </p>
                {useTradeInCoupon && tradeInCoupon > 0 ? (
                  <p className="text-xs text-emerald-400/90 mt-1">
                    {t("tradeInApplied", { amount: tradeInCoupon })}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-600 mt-1">{t("componentsSelected", { count: selectedCount })}</p>
                )}
              </div>

              {selectedCount > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto text-sm border-t border-white/5 pt-3">
                  {BUILDER_CATEGORY_ORDER.map((cat) => {
                    const c = selection[cat];
                    if (!c) return null;
                    return (
                      <li key={cat} className="flex justify-between gap-2 text-zinc-400">
                        <span className="truncate text-xs">{c.name}</span>
                        <span className="text-theme flex-shrink-0 text-xs tabular-nums opacity-90">
                          {formatPrice(c.price, locale)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {missingCategories.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {t("missingParts")}
                  </p>
                  <ul className="space-y-1">
                    {missingCategories.map((cat) => (
                      <li key={cat} className="text-xs text-amber-300/90 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {t(`categories.${cat}`)}
                        {cat === "COOLER" && !selection.COOLER && !selection.AIO ? (
                          <span className="text-zinc-500">/ {t("categories.AIO")}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {issues.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {t("compatibility")}
                  </p>
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2 text-xs p-2.5 rounded-lg",
                        issue.level === "error"
                          ? "bg-red-500/10 text-red-300/90"
                          : "bg-amber-500/10 text-amber-300/90"
                      )}
                    >
                      {issue.level === "error" ? (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{formatBuilderIssue(t, issue.messageKey, issue.params)}</span>
                    </div>
                  ))}
                </div>
              )}

              {tradeInCoupon > 0 ? (
                <div className="rounded-xl bg-theme-soft border border-theme p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-theme" />
                    <span className="text-sm font-medium text-theme">{t("tradeInCoupon")}</span>
                    <Badge variant="accent">{formatPrice(tradeInCoupon, locale)}</Badge>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTradeInCoupon}
                      onChange={(e) => setUseTradeInCoupon(e.target.checked)}
                      className="accent-theme"
                    />
                    {t("applyCoupon")}
                  </label>
                </div>
              ) : null}

              <label className="flex items-start gap-3 cursor-pointer border-t border-white/5 pt-3">
                <input
                  type="checkbox"
                  checked={installmentsRequested}
                  onChange={(e) => setInstallmentsRequested(e.target.checked)}
                  className="mt-0.5 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">
                  {t("installments.requested")}
                  <span className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <CreditCard className="w-3 h-3" />
                    {t("installments.from", { amount: installmentMonthly })}
                  </span>
                  {installmentsRequested ? (
                    <span className="block text-xs text-amber-300/80 mt-1">{t("installments.note")}</span>
                  ) : null}
                </span>
              </label>

              <div className="flex flex-col gap-2.5 pt-1">
                <Button variant="secondary" onClick={handleSave} disabled={orderDisabled} className="w-full">
                  {t("save")}
                </Button>
                <Button size="lg" onClick={scrollToOrder} disabled={orderDisabled} className="w-full">
                  {orderDisabled ? t("orderDisabled") : t("orderRequest")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {selectedCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearBuild}
                    className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 py-2 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("clear")}
                  </button>
                ) : null}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function SpecsList({ specs }: { specs: Record<string, unknown> }) {
  const entries = Object.entries(specs).slice(0, 3);
  if (!entries.length) return null;
  return (
    <ul className="mt-1 space-y-0 hidden sm:block">
      {entries.map(([k, v]) => (
        <li key={k} className="text-[10px] text-zinc-600">
          {k}: {String(v)}
        </li>
      ))}
    </ul>
  );
}
