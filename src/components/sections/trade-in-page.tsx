"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { calculateTradeInEstimate } from "@/lib/trade-in";
import {
  loadStoredContacts,
  saveStoredContacts,
  saveTradeInCoupon,
} from "@/lib/trade-in-storage";
import { localeBasePath } from "@/lib/locale-path";
import { cn } from "@/lib/utils";

type ComponentRow = {
  id: string;
  name: string;
  category: string;
  baseMarketPricePLN?: number;
  price?: number;
};

const TRADE_IN_CATEGORIES = ["GPU", "CPU", "RAM", "PSU"] as const;

export function TradeInPage() {
  const t = useTranslations("tradeInPage");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<"contacts" | "hardware" | "coupon">("contacts");
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState("");
  const [installmentsRequested, setInstallmentsRequested] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/components");
        const data = (await res.json()) as { components?: ComponentRow[] };
        const list = (data.components ?? []).filter((item) =>
          TRADE_IN_CATEGORIES.includes(item.category as (typeof TRADE_IN_CATEGORIES)[number])
        );
        setComponents(list);
      } catch {
        setComponents([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const selectedComponents = useMemo(() => {
    const ids = new Set(Object.values(selectedByCategory).filter(Boolean));
    return components.filter((item) => ids.has(item.id));
  }, [components, selectedByCategory]);

  const estimate = useMemo(
    () =>
      calculateTradeInEstimate(
        selectedComponents.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          newPrice: Number(item.baseMarketPricePLN ?? item.price ?? 0),
        }))
      ),
    [selectedComponents]
  );

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TRADE_IN_CATEGORIES.map((cat) => {
      const items = components
        .filter((item) => item.category === cat)
        .filter((item) => (q ? item.name.toLowerCase().includes(q) : true))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { category: cat, items };
    });
  }, [components, search]);

  useEffect(() => {
    const stored = loadStoredContacts();
    if (!stored) return;
    if (stored.name) setName(stored.name);
    setPhone(stored.phone);
    if (stored.messenger) setMessenger(stored.messenger);
  }, []);

  const createRequest = async (contacts: { phone: string; messenger?: string; name?: string }) => {
    if (!selectedComponents.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contacts.name || t("autoName"),
          phone: contacts.phone,
          messenger: contacts.messenger,
          services: [t("serviceLabel")],
          comment: t("preliminaryHint"),
          selectedComponents: estimate.items
            .filter((item) => item.tradeInPrice != null)
            .map((item) => ({
              category: item.category ?? "OTHER",
              name: item.name,
              price: item.usedMarketPriceMin ?? 0,
              markup: 0,
              finalPrice: item.tradeInPrice ?? 0,
            })),
          totalPrice: estimate.estimatedTotal,
          tradeInDiscountPLN: estimate.estimatedTotal,
          tradeInEstimate: {
            preliminary: true,
            estimatedTotal: estimate.estimatedTotal,
            hasManualItems: estimate.hasManualItems,
            items: estimate.items,
            sourceType: "trade_in",
            selectedParts: estimate.items.map((item) => ({ category: item.category, name: item.name })),
          },
          installmentsRequested,
          couponAppliedToBuild: true,
          sourceType: "trade_in",
          status: "estimated_waiting_service",
          locale,
          source: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "error");
      saveStoredContacts(contacts);
      saveTradeInCoupon({
        amount: estimate.estimatedTotal,
        phone: contacts.phone,
        name: contacts.name,
        appliedAt: new Date().toISOString(),
      });
      toast.success(t("couponIssued", { amount: estimate.estimatedTotal }));
      setStep("coupon");
    } catch {
      toast.error(t("createError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-pad px-4 md:px-8 pt-32 md:pt-36">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold neon-text">{t("contactTitle")}</h1>
          <p className="text-zinc-400 mt-3">{t("contactSubtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="glass rounded-2xl p-4 md:p-5 space-y-4">
            {step === "contacts" ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{t("contactStep")}</p>
                <input
                  className="w-full px-3 py-2 rounded-xl glass text-sm"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full px-3 py-2 rounded-xl glass text-sm"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="w-full px-3 py-2 rounded-xl glass text-sm"
                  placeholder={t("messengerPlaceholder")}
                  value={messenger}
                  onChange={(e) => setMessenger(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={installmentsRequested}
                    onChange={(e) => setInstallmentsRequested(e.target.checked)}
                  />
                  <span>{t("installmentToggle")}</span>
                </label>
                <Button
                  onClick={() => {
                    if (!name.trim()) {
                      toast.error(t("needName"));
                      return;
                    }
                    if (phone.trim().length < 8) {
                      toast.error(t("needPhoneAndName"));
                      return;
                    }
                    saveStoredContacts({
                      name: name.trim(),
                      phone: phone.trim(),
                      messenger: messenger.trim() || undefined,
                    });
                    setStep("hardware");
                  }}
                >
                  {t("continueToHardware")}
                </Button>
              </div>
            ) : null}

            {step !== "contacts" ? (
              <>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{t("hardwareStep")}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="sm:w-auto"
                onClick={() => {
                  setSearch("");
                  setSelectedByCategory({});
                }}
              >
                {t("reset")}
              </Button>
            </div>
            {loading ? <p className="text-zinc-500">{t("loading")}</p> : null}
            {!loading && components.length === 0 ? <p className="text-zinc-500">{t("empty")}</p> : null}
            {grouped.map((group) => (
              <div key={group.category} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm text-yellow-300 font-semibold">{group.category}</h3>
                  {selectedByCategory[group.category] ? (
                    <button
                      type="button"
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      onClick={() =>
                        setSelectedByCategory((prev) => {
                          const next = { ...prev };
                          delete next[group.category];
                          return next;
                        })
                      }
                    >
                      {t("clearCategory")}
                    </button>
                  ) : null}
                </div>
                {group.items.length === 0 ? (
                  <p className="text-xs text-zinc-600">{t("emptyCategory")}</p>
                ) : (
                  <select
                    value={selectedByCategory[group.category] ?? ""}
                    onChange={(e) =>
                      setSelectedByCategory((prev) => ({
                        ...prev,
                        [group.category]: e.target.value,
                      }))
                    }
                    className={cn(
                      "w-full px-4 py-3 rounded-xl glass text-sm text-zinc-300",
                      !selectedByCategory[group.category] && "text-zinc-500"
                    )}
                  >
                    <option value="">{t("selectPlaceholder")}</option>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {Number(item.baseMarketPricePLN ?? item.price ?? 0)} PLN
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
              </>
            ) : null}
          </div>

          <aside className="glass rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-28">
            <p className="text-sm text-zinc-400">{t("selectedCount", { count: selectedComponents.length })}</p>
            <p className="text-xl font-semibold text-emerald-300">
              {t("estimatedCoupon", { amount: estimate.estimatedTotal })}
            </p>
            {estimate.hasManualItems ? <p className="text-xs text-amber-300">{t("manualRequired")}</p> : null}
            <p className="text-xs text-zinc-500">{t("preliminaryHint")}</p>
            <Button
              disabled={step !== "hardware" || selectedComponents.length === 0 || submitting}
              isLoading={submitting}
              onClick={() => {
                if (!name.trim() || phone.trim().length < 8) {
                  toast.error(t("needPhoneAndName"));
                  return;
                }
                void createRequest({
                  phone: phone.trim(),
                  messenger: messenger.trim() || undefined,
                  name: name.trim(),
                });
              }}
            >
              {t("proceedToCoupon")}
            </Button>

            {step === "coupon" ? (
              <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 space-y-2">
                <p className="text-sm font-semibold text-yellow-300">{t("couponCardTitle")}</p>
                <p className="text-base font-bold text-emerald-300">
                  {t("estimatedCoupon", { amount: estimate.estimatedTotal })}
                </p>
                <p className="text-xs text-zinc-400">{t("couponCardNote")}</p>
                <Button
                  size="sm"
                  onClick={() => {
                    const host = typeof window !== "undefined" ? window.location.host : "";
                    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
                    const base = localeBasePath(locale, host, pathname);
                    router.push(`${base}/#builder`);
                  }}
                >
                  {t("toBuilderCta")}
                </Button>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

