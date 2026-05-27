"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUiSound } from "@/hooks/use-ui-sound";
import { calculateTradeInEstimate } from "@/lib/trade-in";
import { cn } from "@/lib/utils";

type ComponentRow = {
  id: string;
  name: string;
  category: string;
  baseMarketPricePLN?: number;
  price?: number;
};

const CONTACTS_STORAGE_KEY = "pkhelp-contacts";
const TRADE_IN_CATEGORIES = ["GPU", "CPU", "RAM", "PSU", "MOTHERBOARD", "SSD", "HDD", "CASE", "COOLER", "AIO", "FANS"];

export function TradeInPage() {
  const t = useTranslations("tradeInPage");
  const locale = useLocale();
  const { playTone } = useUiSound();
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/components");
        const data = (await res.json()) as { components?: ComponentRow[] };
        const list = (data.components ?? []).filter((item) => TRADE_IN_CATEGORIES.includes(item.category));
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

  const loadStoredContacts = () => {
    try {
      const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { phone?: string; messenger?: string };
      if (!parsed.phone) return null;
      return { phone: String(parsed.phone), messenger: String(parsed.messenger ?? "") };
    } catch {
      return null;
    }
  };

  const createRequest = async (contacts: { phone: string; messenger?: string }) => {
    if (!selectedComponents.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t("autoName"),
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
            source: "trade-in-page",
          },
          status: "estimated_waiting_service",
          locale,
          source: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "error");
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      toast.success(t("created"));
      setContactOpen(false);
    } catch {
      toast.error(t("createError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-pad px-4 md:px-8 pt-28">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h1>
          <p className="text-zinc-400 mt-3">{t("subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="glass rounded-2xl p-4 md:p-5 space-y-4">
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
                    onMouseDown={() => playTone("select")}
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
          </div>

          <aside className="glass rounded-2xl p-5 space-y-3 h-fit lg:sticky lg:top-28">
            <p className="text-sm text-zinc-400">{t("selectedCount", { count: selectedComponents.length })}</p>
            <p className="text-xl font-semibold text-emerald-300">
              {t("estimatedCoupon", { amount: estimate.estimatedTotal })}
            </p>
            {estimate.hasManualItems ? <p className="text-xs text-amber-300">{t("manualRequired")}</p> : null}
            <p className="text-xs text-zinc-500">{t("preliminaryHint")}</p>

            <Button
              disabled={selectedComponents.length === 0 || submitting}
              isLoading={submitting}
              onClick={() => {
                const stored = loadStoredContacts();
                if (stored?.phone) {
                  void createRequest(stored);
                  return;
                }
                setContactOpen(true);
              }}
            >
              {t("createCoupon")}
            </Button>

            {contactOpen ? (
              <div className="space-y-2 pt-1">
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
                <Button
                  size="sm"
                  isLoading={submitting}
                  onClick={() => {
                    if (phone.trim().length < 8) {
                      toast.error(t("needPhone"));
                      return;
                    }
                    void createRequest({ phone: phone.trim(), messenger: messenger.trim() || undefined });
                  }}
                >
                  {t("submitContacts")}
                </Button>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

