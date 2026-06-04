"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { adminUrl } from "@/lib/admin-path";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MessageSquare, ShoppingCart, LogOut, Pencil, Images, Users } from "lucide-react";
import { ShowcasePanel } from "@/components/admin/showcase-panel";
import { MastersPanel } from "@/components/admin/masters-panel";
import { OrderComponentsTable } from "@/components/admin/order-components-table";
import {
  ComponentImageUpload,
  uploadPendingComponentImage,
} from "@/components/admin/component-image-upload";
import type { ComponentCategory } from "@prisma/client";
import { calculateMarkupPLN, resolveComponentPrice } from "@/lib/pricing";
import { ComponentImage } from "@/components/ui/component-image";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "components" | "reviews" | "orders" | "showcase" | "masters";

const ORDER_STATUSES = ["NOWE", "W_TRAKCIE", "WYCENIONE", "estimated_waiting_service", "ZAKONCZONE", "ANULOWANE"] as const;
const TRADE_IN_WORKFLOW = [
  { id: "new", status: "NOWE" },
  { id: "estimated_waiting_service", status: "estimated_waiting_service" },
  { id: "in_service_check", status: "W_TRAKCIE" },
  { id: "final_price_confirmed", status: "WYCENIONE" },
  { id: "accepted", status: "ZAKONCZONE" },
  { id: "rejected", status: "ANULOWANE" },
  { id: "used_as_coupon", status: "WYCENIONE" },
] as const;
const CATEGORIES = [
  "CPU", "GPU", "MOTHERBOARD", "RAM", "PSU", "SSD", "HDD", "CASE", "COOLER", "AIO", "FANS",
];

const EXTERNAL_STORES = ["Media Expert", "RTV Euro AGD", "x-kom", "Morele"] as const;

type ComponentRow = {
  id: string;
  category: string;
  name: string;
  brand: string;
  model?: string | null;
  baseMarketPricePLN: number;
  markupPLN: number;
  price: number;
  usedPrice?: number | null;
  socket?: string | null;
  memoryType?: string | null;
  formFactor?: string | null;
  wattage?: number | null;
  capacity?: string | null;
  sourceUrl?: string | null;
  externalPriceUrl?: string | null;
  externalStoreName?: string | null;
  externalPrice?: number | null;
  manualPriceOverride?: number | null;
  lastPriceSyncAt?: string | null;
  imageUrl?: string | null;
  popularityScore: number;
  active: boolean;
};

const emptyComponent = {
  category: "CPU",
  name: "",
  brand: "",
  model: "",
  baseMarketPricePLN: 0,
  markupPLN: 0,
  price: 0,
  usedPrice: 0,
  socket: "",
  memoryType: "",
  formFactor: "",
  wattage: 0,
  capacity: "",
  sourceUrl: "",
  externalPriceUrl: "",
  externalStoreName: "",
  externalPrice: 0,
  manualPriceOverride: 0,
  imageUrl: "",
  popularityScore: 50,
  active: true,
};

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tradeInOnly, setTradeInOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyComponent);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [crmSyncingId, setCrmSyncingId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Record<string, number>>({});
  const pollAbortRef = useRef<AbortController | null>(null);
  const inFlightPollRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pkhelp-admin-sound");
      if (raw === "0") setSoundEnabled(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (audioUnlocked) return;
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [audioUnlocked]);

  const playBell = useCallback(() => {
    if (!soundEnabled || !audioUnlocked) return;
    try {
      const AudioContextImpl = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextImpl();
      const gain = ctx.createGain();
      gain.gain.value = 1;
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = "sine";
      o2.type = "triangle";
      o1.frequency.setValueAtTime(1200, now);
      o2.frequency.setValueAtTime(860, now);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(1.0, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      o1.connect(env);
      o2.connect(env);
      env.connect(gain);

      o1.start(now);
      o2.start(now);
      o1.stop(now + 1.15);
      o2.stop(now + 1.15);
      setTimeout(() => void ctx.close().catch(() => {}), 1300);
    } catch {
      /* ignore */
    }
  }, [soundEnabled, audioUnlocked]);

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    const ordersUrl =
      statusFilter === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${statusFilter}`;
    const o = await fetch(ordersUrl, { cache: "no-store", signal });
    if (o.status === 401) {
      setAuthError(true);
      return null;
    }
    const od = (await o.json()) as { orders?: Array<Record<string, unknown>> };
    return od.orders ?? [];
  }, [statusFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [o, c, r] = await Promise.all([
        fetchOrders(),
        fetch("/api/admin/components"),
        fetch("/api/admin/reviews"),
      ]);
      if (o) setOrders(o);
      const cd = await c.json();
      const rd = await r.json();
      setComponents(cd.components ?? []);
      setReviews(rd.reviews ?? []);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setLastOrderId(null);
  }, [statusFilter]);

  useEffect(() => {
    if (tab !== "orders") return;
    let stopped = false;
    const tick = async () => {
      if (inFlightPollRef.current) return;
      inFlightPollRef.current = true;
      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      let next: Array<Record<string, unknown>> | null = null;
      try {
        next = await fetchOrders(controller.signal);
      } catch {
        next = null;
      } finally {
        inFlightPollRef.current = false;
      }
      if (!next || stopped) return;
      const newestId = next[0] ? String(next[0].id) : null;

      setOrders((prev) => {
        const prevIds = new Set(prev.map((o) => String(o.id)));
        const added = next.filter((o) => !prevIds.has(String(o.id)));
        if (added.length > 0) {
          // Mark new orders for entry animation (auto-expire after ~4s)
          const now = Date.now();
          setNewOrderIds((m) => {
            const copy = { ...m };
            for (const o of added) copy[String(o.id)] = now;
            return copy;
          });
          for (const o of added) {
            toast.message(t("live.newOrder"), {
              description: `${String(o.name)} • ${String(o.phone)}`,
            });
          }
          playBell();
        } else if (newestId && lastOrderId && newestId !== lastOrderId) {
          // Fallback: ordering changed but cannot diff reliably
          playBell();
        }
        return next;
      });

      if (newestId) setLastOrderId(newestId);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 5000);
    return () => {
      stopped = true;
      pollAbortRef.current?.abort();
      window.clearInterval(id);
    };
  }, [tab, fetchOrders, lastOrderId, playBell, t]);

  useEffect(() => {
    if (Object.keys(newOrderIds).length === 0) return;
    const id = window.setInterval(() => {
      const cutoff = Date.now() - 4000;
      setNewOrderIds((m) => {
        const next: Record<string, number> = {};
        for (const [k, ts] of Object.entries(m)) {
          if (ts >= cutoff) next[k] = ts;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [newOrderIds]);

  useEffect(() => {
    if (authError) router.replace(adminUrl(locale));
  }, [authError, router, locale]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace(adminUrl(locale));
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchAll();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const resyncCrm = async (id: string) => {
    setCrmSyncingId(id);
    try {
      const res = await fetch("/api/admin/orders/crm-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? t("crm.syncError"));
      }
    } catch {
      alert(t("crm.syncError"));
    } finally {
      setCrmSyncingId(null);
      fetchAll();
    }
  };

  const crmStatusLabel = (status: unknown) => {
    const key = String(status ?? "PENDING");
    if (key === "SYNCED") return t("crm.synced");
    if (key === "FAILED") return t("crm.failed");
    if (key === "SKIPPED") return t("crm.skipped");
    return t("crm.pending");
  };

  const deriveAdminTasks = (services: unknown, meta: Record<string, unknown> | null) => {
    const serviceList = Array.isArray(services) ? services.map((s) => String(s).toLowerCase()) : [];
    const isTradeIn =
      serviceList.some((s) => s.includes("trade")) ||
      String(meta?.sourceType ?? "") === "trade_in";
    const installmentsRequested = Boolean(meta?.installmentsRequested);
    if (isTradeIn) {
      return [
        "Проверить старое железо и подтвердить купон",
        "Ожидаем клиента в сервисе",
        ...(installmentsRequested ? ["Отправить документы на рассрочку"] : []),
      ];
    }
    return [
      "Связаться с клиентом",
      "Уточнить сборку",
      "Подтвердить наличие",
      ...(installmentsRequested ? ["Отправить документы на рассрочку"] : []),
    ];
  };

  const extractTradeInParts = (meta: Record<string, unknown> | null) => {
    if (!meta) return [];
    const source = Array.isArray(meta.items)
      ? meta.items
      : Array.isArray(meta.selectedParts)
        ? meta.selectedParts
        : [];
    return source
      .map((row) => {
        const part = row as Record<string, unknown>;
        return {
          category: String(part.category ?? "").toUpperCase(),
          name: String(part.name ?? ""),
        };
      })
      .filter((part) => ["GPU", "CPU", "RAM", "PSU"].includes(part.category) && part.name);
  };

  const saveComponent = async () => {
    const payload = {
      ...form,
      wattage: form.wattage || undefined,
      specs: {},
      imageUrl: form.imageUrl || "",
      sourceUrl: form.sourceUrl || "",
    };
    let savedId = editingId;
    if (editingId) {
      const res = await fetch("/api/admin/components", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      const json = await res.json();
      savedId = json.component?.id ?? editingId;
    } else {
      const res = await fetch("/api/admin/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      savedId = json.component?.id ?? null;
    }
    if (pendingImageFile && savedId) {
      try {
        await uploadPendingComponentImage(savedId, pendingImageFile);
      } catch {
        /* upload errors surfaced via toast in upload helper */
      }
    }
    setEditingId(null);
    setForm(emptyComponent);
    setPendingImageFile(null);
    fetchAll();
  };

  const editComponent = (c: ComponentRow) => {
    setEditingId(c.id);
    setPendingImageFile(null);
    setForm({
      category: c.category,
      name: c.name,
      brand: c.brand,
      model: c.model ?? "",
      baseMarketPricePLN: c.baseMarketPricePLN,
      markupPLN: c.markupPLN,
      price: c.price,
      socket: c.socket ?? "",
      memoryType: c.memoryType ?? "",
      formFactor: c.formFactor ?? "",
      wattage: c.wattage ?? 0,
      capacity: c.capacity ?? "",
      sourceUrl: c.sourceUrl ?? "",
      externalPriceUrl: c.externalPriceUrl ?? "",
      externalStoreName: c.externalStoreName ?? "",
      externalPrice: c.externalPrice ?? 0,
      manualPriceOverride: c.manualPriceOverride ?? 0,
      usedPrice: c.usedPrice ?? 0,
      imageUrl: c.imageUrl ?? "",
      popularityScore: c.popularityScore,
      active: c.active,
    });
    setTab("components");
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/components", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    fetchAll();
  };

  const deleteComponent = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    await fetch(`/api/admin/components?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const addReview = async () => {
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    setNewReview({ name: "", text: "", rating: 5 });
    fetchAll();
  };

  const deleteReview = async (id: string) => {
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const tabs: { id: Tab; icon: typeof Package; label: string }[] = [
    { id: "orders", icon: ShoppingCart, label: t("orders") },
    { id: "components", icon: Package, label: t("components") },
    { id: "showcase", icon: Images, label: t("showcaseTab") },
    { id: "masters", icon: Users, label: t("mastersTab") },
    { id: "reviews", icon: MessageSquare, label: t("reviews") },
  ];

  const filteredComponents = useMemo(() => {
    if (categoryFilter === "all") return components;
    return components.filter((c) => c.category === categoryFilter);
  }, [components, categoryFilter]);
  const visibleOrders = useMemo(() => {
    if (!tradeInOnly) return orders;
    return orders.filter((o) => {
      const services = Array.isArray(o.services) ? (o.services as unknown[]) : [];
      return services.some((s) => String(s).toLowerCase().includes("trade"));
    });
  }, [orders, tradeInOnly]);

  const predictedPrice = useMemo(() => {
    return resolveComponentPrice(
      form.baseMarketPricePLN,
      form.markupPLN || null,
      form.price || null
    ).price;
  }, [form.baseMarketPricePLN, form.markupPLN, form.price]);

  const applyBasePrice = (base: number) => {
    const markup = calculateMarkupPLN(base);
    setForm({
      ...form,
      baseMarketPricePLN: base,
      markupPLN: markup,
      price: base + markup,
    });
  };

  const applyAutoMarkup = () => {
    const markup = calculateMarkupPLN(form.baseMarketPricePLN);
    setForm({
      ...form,
      markupPLN: markup,
      price: form.baseMarketPricePLN + markup,
    });
  };

  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Logo href={locale === "pl" ? "/" : `/${locale}`} size="sm" />
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold neon-text">{t("dashboard")}</h1>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                tab === id ? "bg-yellow-500/40 text-white" : "glass text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "showcase" && <ShowcasePanel />}

        {tab === "masters" && <MastersPanel />}

        {loading && (tab === "orders" || tab === "components" || tab === "reviews") ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : (
          <>
            {tab === "orders" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl glass text-sm"
                  >
                    <option value="all">{t("filterAll")}</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-sm text-zinc-400 px-2">
                    <input
                      type="checkbox"
                      checked={tradeInOnly}
                      onChange={(e) => setTradeInOnly(e.target.checked)}
                    />
                    <span>{t("tradeInOnly")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-400 px-2">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setSoundEnabled(next);
                        try {
                          localStorage.setItem("pkhelp-admin-sound", next ? "1" : "0");
                        } catch {
                          /* ignore */
                        }
                      }}
                    />
                    <span>{t("live.sound")}</span>
                    <span className="text-xs text-zinc-600">
                      {soundEnabled ? t("live.enabled") : t("live.disabled")}
                    </span>
                  </label>
                </div>
                {visibleOrders.length === 0 ? (
                  <p className="text-zinc-500">{t("noOrders")}</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {visibleOrders.map((o) => {
                      const id = String(o.id);
                      const isNew = Boolean(newOrderIds[id]);
                      const estimateMeta =
                        o.tradeInEstimate && typeof o.tradeInEstimate === "object"
                          ? (o.tradeInEstimate as Record<string, unknown>)
                          : null;
                      const installmentsRequested = Boolean(estimateMeta?.installmentsRequested);
                      const couponAppliedToBuild = Boolean(estimateMeta?.couponAppliedToBuild);
                      const sourceType = String(estimateMeta?.sourceType ?? "").trim();
                      const couponAmount =
                        typeof estimateMeta?.estimatedTotal === "number"
                          ? Number(estimateMeta.estimatedTotal)
                          : typeof o.tradeInDiscountPLN === "number"
                            ? Number(o.tradeInDiscountPLN)
                            : 0;
                      const isTradeIn =
                        Array.isArray(o.services) &&
                        (o.services as string[]).some((s) => /trade/i.test(s)) ||
                        sourceType === "trade_in";
                      const tradeInParts = extractTradeInParts(estimateMeta);
                      const taskItems = deriveAdminTasks(o.services, estimateMeta);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: -10, scale: 0.995 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={`glass rounded-2xl p-5 space-y-3 ${isNew ? "ring-1 ring-yellow-500/40" : ""}`}
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-medium">{String(o.name)}</span>
                            <span className="text-xs text-zinc-500">
                              {new Date(String(o.createdAt)).toLocaleString("pl-PL")}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-400">
                            <span>{t("orderFields.phone")}: {String(o.phone)}</span>
                            {o.email ? <span>{t("orderFields.email")}: {String(o.email)}</span> : null}
                            {o.messenger ? (
                              <span>{t("orderFields.messenger")}: {String(o.messenger)}</span>
                            ) : null}
                            {o.totalPrice ? (
                              <span className="text-yellow-400">
                                {t("orderFields.total")}: {String(o.totalPrice)} PLN
                              </span>
                            ) : null}
                            {typeof o.tradeInDiscountPLN === "number" && o.tradeInDiscountPLN > 0 ? (
                              <span className="text-emerald-400">
                                Trade-In: -{String(o.tradeInDiscountPLN)} PLN
                              </span>
                            ) : null}
                            <span>{t("orderFields.installments")}: {installmentsRequested ? t("yes") : t("no")}</span>
                            <span>{t("orderFields.couponApplied")}: {couponAppliedToBuild ? t("yes") : t("no")}</span>
                            {sourceType ? <span>{t("orderFields.sourceType")}: {sourceType}</span> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isTradeIn ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" : "bg-zinc-700/40 text-zinc-300 border border-zinc-600/40"}`}>
                              Trade-In: {isTradeIn ? t("yes") : t("no")}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${installmentsRequested ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-zinc-700/40 text-zinc-300 border border-zinc-600/40"}`}>
                              {t("orderFields.installments")}: {installmentsRequested ? t("yes") : t("no")}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${couponAppliedToBuild ? "bg-orange-500/20 text-orange-300 border border-orange-500/40" : "bg-zinc-700/40 text-zinc-300 border border-zinc-600/40"}`}>
                              {t("orderFields.couponApplied")}: {couponAppliedToBuild ? t("yes") : t("no")}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-200 border border-yellow-500/30">
                              Coupon: {couponAmount > 0 ? `${couponAmount} PLN` : "0 PLN"}
                            </span>
                          </div>
                          {tradeInParts.length > 0 ? (
                            <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-3 py-2 text-sm">
                              <p className="text-yellow-300 font-semibold mb-1">СТАРОЕ ЖЕЛЕЗО КЛИЕНТА</p>
                              <div className="grid sm:grid-cols-2 gap-1 text-zinc-300">
                                {tradeInParts.map((part) => (
                                  <span key={`${id}-${part.category}`}>{part.category}: {part.name}</span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                            <p className="text-zinc-300 font-medium mb-1">Что нужно сделать админу</p>
                            <ul className="space-y-1 text-zinc-400">
                              {taskItems.map((task) => (
                                <li key={`${id}-${task}`}>- {task}</li>
                              ))}
                            </ul>
                            {installmentsRequested ? (
                              <p className="mt-2 text-xs text-zinc-500">
                                Контакты для документов: {String(o.phone)} {o.messenger ? `• ${String(o.messenger)}` : ""} {o.email ? `• ${String(o.email)}` : ""}
                              </p>
                            ) : null}
                          </div>
                          {Array.isArray(o.services) && (o.services as string[]).length > 0 ? (
                            <p className="text-sm text-zinc-500">
                              {t("orderFields.services")}: {(o.services as string[]).join(", ")}
                            </p>
                          ) : null}
                          {o.comment ? (
                            <p className="text-sm text-zinc-500">{String(o.comment)}</p>
                          ) : null}
                          <OrderComponentsTable
                            selectedComponents={o.selectedComponents}
                            buildJson={o.buildJson}
                            totalPrice={
                              typeof o.totalPrice === "number" ? o.totalPrice : undefined
                            }
                          />
                          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-zinc-500">{t("crm.label")}:</span>
                              <span
                                className={
                                  o.crmSyncStatus === "SYNCED"
                                    ? "text-emerald-400"
                                    : o.crmSyncStatus === "FAILED"
                                      ? "text-red-400"
                                      : o.crmSyncStatus === "SKIPPED"
                                        ? "text-zinc-500"
                                        : "text-amber-400"
                                }
                              >
                                {crmStatusLabel(o.crmSyncStatus)}
                              </span>
                              {typeof o.crmDealUrl === "string" && o.crmDealUrl ? (
                                <a
                                  href={o.crmDealUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-yellow-400 hover:underline text-xs"
                                >
                                  {t("crm.openDeal")}
                                </a>
                              ) : null}
                            </div>
                            {typeof o.crmSyncError === "string" && o.crmSyncError ? (
                              <p className="text-xs text-red-400/90 break-words">{o.crmSyncError}</p>
                            ) : null}
                            {o.crmSyncedAt ? (
                              <p className="text-xs text-zinc-600">
                                {t("crm.syncedAt")}:{" "}
                                {new Date(String(o.crmSyncedAt)).toLocaleString("pl-PL")}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {isTradeIn ? (
                              <div className="flex flex-wrap gap-1">
                                {TRADE_IN_WORKFLOW.map((step) => (
                                  <Button
                                    key={step.id}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateOrderStatus(String(o.id), step.status)}
                                  >
                                    {t(`tradeInStatus.${step.id}`)}
                                  </Button>
                                ))}
                              </div>
                            ) : null}
                            <select
                              value={String(o.status)}
                              onChange={(e) => updateOrderStatus(String(o.id), e.target.value)}
                              className="px-3 py-1.5 rounded-lg glass text-sm"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {t(`status.${s}`)}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={crmSyncingId === String(o.id)}
                              onClick={() => resyncCrm(String(o.id))}
                            >
                              {crmSyncingId === String(o.id) ? t("crm.syncing") : t("crm.resync")}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteOrder(String(o.id))}>
                              {t("delete")}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            )}

            {tab === "components" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-yellow-300/90">
                    {editingId ? t("edit") : t("add")} — {t("componentFields.category")}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                    aria-label={t("componentFields.category")}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder={t("componentFields.name")}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder={t("componentFields.brand")}
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder={t("componentFields.model")}
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.basePrice")}
                    value={form.baseMarketPricePLN || ""}
                    onChange={(e) => applyBasePrice(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.markup")}
                    value={form.markupPLN || ""}
                    onChange={(e) => {
                      const markup = Number(e.target.value);
                      setForm({
                        ...form,
                        markupPLN: markup,
                        price: form.baseMarketPricePLN + markup,
                      });
                    }}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      placeholder={t("componentFields.finalPrice")}
                      value={form.price || predictedPrice}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg glass text-sm"
                    />
                    <button
                      type="button"
                      onClick={applyAutoMarkup}
                      className="text-left text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
                    >
                      {t("priceAutoHint")}
                    </button>
                  </div>
                  <input
                    placeholder={t("componentFields.socket")}
                    value={form.socket}
                    onChange={(e) => setForm({ ...form, socket: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder={t("componentFields.memoryType")}
                    value={form.memoryType}
                    onChange={(e) => setForm({ ...form, memoryType: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder={t("componentFields.formFactor")}
                    value={form.formFactor}
                    onChange={(e) => setForm({ ...form, formFactor: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.popularity")}
                    value={form.popularityScore}
                    onChange={(e) =>
                      setForm({ ...form, popularityScore: Number(e.target.value) })
                    }
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder={t("componentFields.sourceUrl")}
                    value={form.sourceUrl}
                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.usedPrice")}
                    value={form.usedPrice || ""}
                    onChange={(e) => setForm({ ...form, usedPrice: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.manualOverride")}
                    value={form.manualPriceOverride || ""}
                    onChange={(e) => setForm({ ...form, manualPriceOverride: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <input
                      list="external-store-presets"
                      placeholder={t("componentFields.externalStore")}
                      value={form.externalStoreName}
                      onChange={(e) => setForm({ ...form, externalStoreName: e.target.value })}
                      className="px-3 py-2 rounded-lg glass text-sm"
                    />
                    <datalist id="external-store-presets">
                      {EXTERNAL_STORES.map((store) => (
                        <option key={store} value={store} />
                      ))}
                    </datalist>
                    <div className="flex flex-wrap gap-1">
                      {EXTERNAL_STORES.map((store) => (
                        <button
                          key={store}
                          type="button"
                          onClick={() => setForm({ ...form, externalStoreName: store })}
                          className="text-xs px-2 py-0.5 rounded-md border border-white/10 text-zinc-500 hover:text-yellow-400 hover:border-yellow-500/30 transition-colors"
                        >
                          {store}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    placeholder={t("componentFields.externalUrl")}
                    value={form.externalPriceUrl}
                    onChange={(e) => setForm({ ...form, externalPriceUrl: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder={t("componentFields.externalPrice")}
                    value={form.externalPrice || ""}
                    onChange={(e) => setForm({ ...form, externalPrice: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  {editingId && form.externalPriceUrl ? (
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(form.externalPriceUrl, "_blank")}
                      >
                        {t("componentFields.openStore")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!editingId) return;
                          await fetch("/api/admin/components/sync-price", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: editingId, externalPrice: form.externalPrice || undefined }),
                          });
                          fetchAll();
                          toast.success(t("componentFields.priceSynced"));
                        }}
                      >
                        {t("componentFields.syncPrice")}
                      </Button>
                    </div>
                  ) : null}
                  <ComponentImageUpload
                    componentId={editingId}
                    imageUrl={form.imageUrl}
                    onImageUrlChange={(url) => setForm({ ...form, imageUrl: url })}
                    onPendingFile={setPendingImageFile}
                  />
                  <label className="flex items-center gap-2 text-sm text-zinc-400 px-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    {t("active")}
                  </label>
                  <div className="sm:col-span-2 flex gap-2">
                    <Button onClick={saveComponent}>{editingId ? t("save") : t("add")}</Button>
                    {editingId && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setForm(emptyComponent);
                          setPendingImageFile(null);
                        }}
                      >
                        {t("cancel")}
                      </Button>
                    )}
                  </div>
                </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm text-zinc-400">{t("filterCategory")}</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl glass text-sm"
                  >
                    <option value="all">{t("allCategories")}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-zinc-600">
                    {filteredComponents.length} / {components.length}
                  </span>
                </div>
                {components.length === 0 ? (
                  <p className="text-zinc-500">{t("noComponents")}</p>
                ) : (
                  filteredComponents.map((c) => (
                    <div
                      key={c.id}
                      className="glass rounded-xl p-4 flex flex-wrap justify-between items-center gap-3"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="relative w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          <ComponentImage
                            src={c.imageUrl}
                            alt={c.name}
                            category={c.category as ComponentCategory}
                            sizes="56px"
                          />
                        </div>
                      <div>
                        <span className="text-xs text-yellow-400">{c.category}</span>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-zinc-500">
                          {c.brand} — {c.baseMarketPricePLN} + {c.markupPLN} = {c.price} PLN
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {c.active ? t("active") : t("inactive")}
                        </p>
                      </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => editComponent(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(c.id, c.active)}>
                          {c.active ? t("inactive") : t("active")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteComponent(c.id)}>
                          {t("delete")}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-5 grid sm:grid-cols-3 gap-3">
                  <input
                    placeholder="Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <input
                    placeholder="Text"
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="px-3 py-2 rounded-lg glass text-sm"
                  />
                  <Button onClick={addReview}>{t("add")}</Button>
                </div>
                {reviews.map((r) => (
                  <div
                    key={String(r.id)}
                    className="glass rounded-xl p-4 flex justify-between items-start gap-4"
                  >
                    <div>
                      <p className="font-medium">{String(r.name)}</p>
                      <p className="text-sm text-zinc-500 mt-1">{String(r.text)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteReview(String(r.id))}>
                      {t("delete")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
