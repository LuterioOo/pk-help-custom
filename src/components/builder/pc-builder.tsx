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
  } = useBuild();
  const [components, setComponents] = useState<ApiComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const categoryNavRef = useRef<HTMLElement>(null);
  const componentsRef = useRef<HTMLDivElement>(null);
  const { playTone } = useUiSound();

  const scrollCategoryIntoView = useCallback((cat: ComponentCategory) => {
    const btn = categoryNavRef.current?.querySelector(`[data-category="${cat}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const scrollComponentsIntoView = useCallback(() => {
    componentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const next = getNextCategory(c.category);
    if (next) {
      window.setTimeout(() => {
        setActiveCategory(next);
        scrollCategoryIntoView(next);
        scrollComponentsIntoView();
      }, 180);
    }
  };

  const handleSave = () => {
    saveToStorage();
    toast.success(t("save"));
  };

  const scrollToOrder = () => {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
    toast.info(t("send"));
  };

  return (
    <section id="builder" className="section-pad px-3 sm:px-4 md:px-8 pb-24 xl:pb-8">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal className="mb-5 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_320px] gap-3 md:gap-5">
          {/* Categories — horizontal chips on mobile, sidebar on desktop */}
          <ScrollReveal className="xl:sticky xl:top-28 xl:self-start order-1 -mx-1 sm:mx-0">
            <nav
              ref={categoryNavRef}
              className="rounded-xl xl:rounded-2xl bg-white/[0.02] border border-white/5 p-1.5 xl:p-2 flex xl:flex-col gap-1 overflow-x-auto xl:overflow-x-visible scrollbar-hide sticky top-[calc(2.85rem+env(safe-area-inset-top))] xl:top-28 z-20"
            >
              {BUILDER_CATEGORY_ORDER.map((cat) => {
                const selected = selection[cat];
                const isActive = activeCategory === cat;
                const locked = isCategoryLocked(cat, selection);
                return (
                  <button
                    key={cat}
                    type="button"
                    data-category={cat}
                    onClick={() => handleCategoryClick(cat)}
                    aria-disabled={locked}
                    className={cn(
                      "flex-shrink-0 xl:w-full text-left px-2.5 py-2 xl:px-3 xl:py-3 rounded-lg xl:rounded-xl text-[11px] sm:text-xs xl:text-sm transition-all duration-200 flex items-center gap-1.5 xl:justify-between xl:gap-2 whitespace-nowrap xl:whitespace-normal touch-manipulation min-h-[36px]",
                      isActive
                        ? "bg-yellow-500/25 text-yellow-100 font-medium border border-yellow-500/30"
                        : locked
                          ? "text-zinc-600 bg-white/[0.01] border border-transparent cursor-not-allowed opacity-70"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent cursor-pointer",
                      selected && !isActive && !locked && "border-emerald-500/20"
                    )}
                  >
                    <span className="truncate">{t(`categories.${cat}`)}</span>
                    {locked ? (
                      <Lock className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-zinc-600 flex-shrink-0" />
                    ) : selected ? (
                      <Check className="w-3 h-3 xl:w-4 xl:h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <span className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollReveal>

          {/* Components — center */}
          <div ref={componentsRef} className="space-y-4 order-3 xl:order-2 min-w-0 scroll-mt-28">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/30"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-zinc-300 cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-zinc-300 cursor-pointer"
              >
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-zinc-500 py-16">{t("noResults")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {filtered.map((c) => {
                  const isSelected = selection[c.category]?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={cn(
                        "tap-scale text-left p-4 rounded-2xl transition-all touch-manipulation cursor-pointer group",
                        "bg-white/[0.02] border hover:border-yellow-500/25 hover:bg-white/[0.04]",
                        isSelected
                          ? "border-yellow-500/50 bg-yellow-500/[0.06] ring-1 ring-yellow-500/30"
                          : "border-white/8"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 overflow-hidden bg-black/30">
                          <ComponentImage
                            src={c.imageUrl}
                            alt={c.name}
                            category={c.category}
                            sizes="96px"
                          />
                          {isSelected ? (
                            <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                              <Check className="w-6 h-6 text-yellow-300" />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="accent" className="mb-1">{c.brand}</Badge>
                          <p className="font-medium text-sm sm:text-base text-zinc-100 line-clamp-2">{c.name}</p>
                          <p className="mt-1.5 text-lg font-bold text-yellow-400">
                            {formatPrice(c.price, locale)}
                          </p>
                          <SpecsList specs={c.specs} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary — sticky right on desktop; inline card on mobile (compact bar below) */}
          <ScrollReveal delay={0.1} className="xl:sticky xl:top-28 xl:self-start order-2 xl:order-3 hidden xl:block">
            <div className="rounded-2xl bg-white/[0.03] border border-yellow-500/15 p-5 sm:p-6 space-y-5">
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

              {/* Selected parts list */}
              {selectedCount > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto text-sm border-t border-white/5 pt-3">
                  {BUILDER_CATEGORY_ORDER.map((cat) => {
                    const c = selection[cat];
                    if (!c) return null;
                    return (
                      <li key={cat} className="flex justify-between gap-2 text-zinc-400">
                        <span className="truncate text-xs">{c.name}</span>
                        <span className="text-yellow-400/90 flex-shrink-0 text-xs tabular-nums">
                          {formatPrice(c.price, locale)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

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
                <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/15 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-300">{t("tradeInCoupon")}</span>
                    <Badge variant="accent">{formatPrice(tradeInCoupon, locale)}</Badge>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTradeInCoupon}
                      onChange={(e) => setUseTradeInCoupon(e.target.checked)}
                      className="accent-yellow-500"
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
                <Button variant="secondary" onClick={handleSave} className="w-full">
                  {t("save")}
                </Button>
                <Button size="lg" onClick={scrollToOrder} className="w-full">
                  {t("orderRequest")}
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

        {/* Mobile sticky summary bar */}
        <div className="xl:hidden fixed inset-x-0 bottom-0 z-30 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 pointer-events-none">
          <div className="pointer-events-auto max-w-lg mx-auto glass-strong rounded-xl border border-yellow-500/20 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] p-2 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500 leading-none">{t("summaryTitle")}</p>
              <p className="text-lg font-bold neon-text tabular-nums leading-tight truncate">
                {formatPrice(displayTotal, locale)}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">
                {t("componentsSelected", { count: selectedCount })}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Button size="sm" onClick={scrollToOrder} className="min-h-[40px] px-4 text-xs">
                {t("orderRequest")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <button
                type="button"
                onClick={handleSave}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 py-0.5"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecsList({ specs }: { specs: Record<string, unknown> }) {
  const entries = Object.entries(specs).slice(0, 3);
  if (!entries.length) return null;
  return (
    <ul className="mt-2 space-y-0.5">
      {entries.map(([k, v]) => (
        <li key={k} className="text-[10px] text-zinc-600">
          {k}: {String(v)}
        </li>
      ))}
    </ul>
  );
}
