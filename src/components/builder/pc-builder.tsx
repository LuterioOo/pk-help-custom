"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ComponentCategory } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { ComponentImage } from "@/components/ui/component-image";
import {
  Search,
  AlertTriangle,
  AlertCircle,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { useBuild } from "@/store/build-store";
import type { ComponentSpec } from "@/lib/compatibility";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBuilderIssue } from "@/lib/format-builder-issue";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES: ComponentCategory[] = [
  "CASE", "CPU", "MOTHERBOARD", "GPU", "RAM", "SSD", "HDD", "PSU", "COOLER", "AIO", "FANS",
];

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
  const { selection, issues, total, selectComponent, clearBuild, saveToStorage } = useBuild();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>("CPU");
  const [components, setComponents] = useState<ApiComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [previewOpen, setPreviewOpen] = useState(false);

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
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q)
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

  const handleSelect = (c: ApiComponent) => {
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
    } else {
      selectComponent(c.category, spec);
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
    <section id="builder" className="py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-3 text-zinc-400">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[240px_1fr_300px] gap-6">
          {/* Categories */}
          <ScrollReveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-2xl p-3 space-y-1 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const selected = selection[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between gap-2",
                      activeCategory === cat
                        ? "bg-yellow-500/30 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="truncate">{t(`categories.${cat}`)}</span>
                    {selected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Component list */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl glass text-sm text-zinc-300"
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
                className="px-4 py-2.5 rounded-xl glass text-sm text-zinc-300"
              >
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">{t("noResults")}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((c) => {
                    const isSelected = selection[c.category]?.id === c.id;
                    return (
                      <motion.button
                        key={c.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => handleSelect(c)}
                        className={cn(
                          "text-left p-4 rounded-2xl glass transition-all",
                          isSelected && "neon-border ring-1 ring-yellow-500/50"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
                            <ComponentImage src={c.imageUrl} alt={c.name} sizes="80px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-yellow-400">{c.brand}</p>
                            <p className="font-medium text-sm truncate">{c.name}</p>
                            <p className="mt-1 text-yellow-300 font-semibold">
                              {formatPrice(c.price, locale)}
                            </p>
                            <SpecsList specs={c.specs} />
                          </div>
                        </div>
                        <span
                          className={cn(
                            "mt-3 inline-flex text-xs px-2 py-1 rounded-md",
                            isSelected ? "bg-yellow-500/40 text-white" : "bg-white/5 text-zinc-400"
                          )}
                        >
                          {isSelected ? t("selected") : t("select")}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Sidebar summary */}
          <ScrollReveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-2xl p-5 space-y-4 neon-border">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">{t("finalPrice")}</span>
                <span className="text-2xl font-bold neon-text">
                  {formatPrice(total, locale)}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{t("total")}: {formatPrice(total, locale)}</p>

              {issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("compatibility")}
                  </p>
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2 text-xs p-2 rounded-lg",
                        issue.level === "error"
                          ? "bg-red-500/10 text-red-300"
                          : "bg-amber-500/10 text-amber-300"
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

              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(!previewOpen)}>
                  {t("preview")}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", previewOpen && "rotate-180")} />
                </Button>
                <AnimatePresence>
                  {previewOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2 text-sm text-zinc-400 max-h-48 overflow-y-auto">
                        {CATEGORIES.map((cat) => {
                          const c = selection[cat];
                          if (!c) return null;
                          return (
                            <li key={cat} className="flex justify-between gap-2">
                              <span className="truncate">{c.name}</span>
                              <span className="text-yellow-400 flex-shrink-0">
                                {formatPrice(c.price, locale)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button variant="secondary" size="sm" onClick={handleSave}>
                  {t("save")}
                </Button>
                <Button size="sm" onClick={scrollToOrder}>
                  {t("send")}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearBuild}>
                  <X className="w-4 h-4" />
                  {t("clear")}
                </Button>
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
    <ul className="mt-2 space-y-0.5">
      {entries.map(([k, v]) => (
        <li key={k} className="text-[10px] text-zinc-600">
          {k}: {String(v)}
        </li>
      ))}
    </ul>
  );
}
