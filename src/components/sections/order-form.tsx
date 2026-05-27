"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBuild } from "@/store/build-store";
import { selectionToSelectedComponents } from "@/lib/order-components";
import { calculateTradeInEstimate } from "@/lib/trade-in";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

import { saveStoredContacts, loadStoredContacts } from "@/lib/trade-in-storage";

const serviceKeys = ["build", "consult", "upgrade", "repair", "custom"] as const;

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  messenger: z.string().optional(),
  services: z.array(z.string()).optional(),
  comment: z.string().optional(),
  attachBuild: z.boolean().optional(),
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

export function OrderForm() {
  const t = useTranslations("order");
  const locale = useLocale();
  const {
    selection,
    total,
    setTradeInCoupon,
    useTradeInCoupon,
    setUseTradeInCoupon,
    totalAfterTradeIn,
    installmentMonthly,
  } = useBuild();
  const hasBuild = Object.keys(selection).length > 0;
  const [tradeInContactOpen, setTradeInContactOpen] = useState(false);
  const [tradeInPhone, setTradeInPhone] = useState("");
  const [tradeInMessenger, setTradeInMessenger] = useState("");
  const [tradeInSubmitting, setTradeInSubmitting] = useState(false);
  const [installmentsRequested, setInstallmentsRequested] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { attachBuild: true, services: [] },
  });

  const selectedServices = watch("services") ?? [];

  const tradeInEstimate = useMemo(() => {
    const selected = Object.values(selection);
    if (!selected.length) return null;
    const items = selected
      .filter((c) => c && typeof c === "object")
      .map((c) => c as { name?: string; category?: string; baseMarketPricePLN?: number; price?: number });
    const estimate = calculateTradeInEstimate(
      items
        .filter((c) => typeof c.name === "string")
        .map((c) => ({
          name: c.name as string,
          category: c.category,
          newPrice: Number(c.baseMarketPricePLN ?? c.price ?? 0),
        }))
    );
    const couponPLN = estimate.estimatedTotal;
    return {
      items: estimate.items,
      couponPLN: Math.round(couponPLN),
      sumMin: estimate.sumMin,
      sumMax: estimate.sumMax,
      discountedTotal: Math.max(0, Math.round(total - couponPLN)),
      hasManualItems: estimate.hasManualItems,
    };
  }, [selection, total]);

  useEffect(() => {
    if (!tradeInEstimate) {
      setTradeInCoupon(0);
      return;
    }
    setTradeInCoupon(tradeInEstimate.couponPLN);
  }, [tradeInEstimate, setTradeInCoupon]);

  const storeContacts = (phone: string, messenger?: string) => {
    saveStoredContacts({ phone, messenger });
  };

  const createTradeInRequest = async (contacts: { phone: string; messenger?: string }) => {
    if (!tradeInEstimate) return;
    setTradeInSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t("tradeIn.autoName"),
          phone: contacts.phone,
          messenger: contacts.messenger,
          services: [t("tradeIn.serviceLabel")],
          comment: t("tradeIn.preliminaryNote"),
          buildJson: hasBuild ? selection : undefined,
          selectedComponents: hasBuild ? selectionToSelectedComponents(selection) : undefined,
          totalPrice: totalAfterTradeIn,
          tradeInDiscountPLN: tradeInEstimate.couponPLN,
          tradeInEstimate: {
            estimatedTotal: tradeInEstimate.couponPLN,
            hasManualItems: tradeInEstimate.hasManualItems,
            couponPLN: tradeInEstimate.couponPLN,
            items: tradeInEstimate.items,
            preliminary: true,
            selectedParts: tradeInEstimate.items.map((item) => ({
              category: item.category,
              name: item.name,
            })),
          },
          installmentsRequested,
          couponAppliedToBuild: useTradeInCoupon,
          sourceType: "trade_in",
          status: "estimated_waiting_service",
          locale,
          source: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string; error?: string };
      if (!res.ok || !json.success) throw new Error(json.message ?? json.error ?? "error");
      storeContacts(contacts.phone, contacts.messenger);
      toast.success(t("tradeIn.requestCreated"));
      setTradeInContactOpen(false);
    } catch (err) {
      console.error("Trade-In request failed:", err);
      toast.error(t("tradeIn.requestError"));
    } finally {
      setTradeInSubmitting(false);
    }
  };

  const toggleService = (label: string) => {
    const next = selectedServices.includes(label)
      ? selectedServices.filter((s) => s !== label)
      : [...selectedServices, label];
    setValue("services", next);
  };

  const onSubmit = async (data: FormData) => {
    if (data.website) return;
    try {
      storeContacts(data.phone, data.messenger);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          messenger: data.messenger,
          services: data.services,
          comment: data.comment,
          buildJson: data.attachBuild && hasBuild ? selection : undefined,
          selectedComponents:
            data.attachBuild && hasBuild ? selectionToSelectedComponents(selection) : undefined,
          totalPrice: data.attachBuild && hasBuild ? (useTradeInCoupon ? totalAfterTradeIn : total) : undefined,
          tradeInDiscountPLN: data.attachBuild && hasBuild && useTradeInCoupon ? Math.max(0, total - totalAfterTradeIn) : undefined,
          tradeInEstimate:
            data.attachBuild && hasBuild
              ? {
                  sourceType: "builder",
                  installmentsRequested,
                  couponAppliedToBuild: useTradeInCoupon,
                }
              : undefined,
          installmentsRequested,
          couponAppliedToBuild: useTradeInCoupon,
          sourceType: "builder",
          locale,
          source:
            typeof window !== "undefined"
              ? window.location.href
              : undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 429) {
          toast.error(t("errorRateLimit"));
          return;
        }
        if (
          json.error === "Database unavailable" ||
          json.message === "Database unavailable" ||
          json.error === "Database schema missing" ||
          json.message?.includes("db:push")
        ) {
          toast.error(t("errorDatabase"));
          return;
        }
        if (json.error === "Validation failed") {
          toast.error(t("errorValidation"));
          return;
        }
        throw new Error(json.message ?? json.error ?? "error");
      }
      toast.success(t("success"));
      reset({ attachBuild: true, services: [] });
    } catch (err) {
      console.error("Order submit failed:", err);
      toast.error(t("error"));
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all";

  return (
    <section id="order" className="section-pad px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">{t("title")}</h2>
          <p className="mt-4 text-zinc-400">{t("subtitle")}</p>
        </ScrollReveal>

        <ScrollReveal>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="glass rounded-2xl p-6 md:p-8 space-y-5 neon-border"
          >
            <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">{t("name")}</label>
              <input {...register("name")} className={cn(inputClass, errors.name && "ring-red-500/50")} />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">{t("phone")}</label>
              <input {...register("phone")} type="tel" className={cn(inputClass, errors.phone && "ring-red-500/50")} />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">{t("email")}</label>
              <input {...register("email")} type="email" className={cn(inputClass, errors.email && "ring-red-500/50")} />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">{t("messenger")}</label>
              <input {...register("messenger")} className={inputClass} placeholder="@username" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">{t("services")}</label>
              <div className="flex flex-wrap gap-2">
                {serviceKeys.map((key) => {
                  const label = t(`serviceOptions.${key}`);
                  const active = selectedServices.includes(label);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleService(label)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all",
                        active
                          ? "bg-yellow-500/40 border-yellow-500/50 text-white"
                          : "glass border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">{t("comment")}</label>
              <textarea {...register("comment")} rows={4} className={cn(inputClass, "resize-none")} />
            </div>
            {hasBuild && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("attachBuild")}
                  className="w-4 h-4 rounded accent-yellow-500"
                />
                <span className="text-sm text-zinc-400">
                  {t("attachBuild")} ({total.toLocaleString("pl-PL")} PLN)
                </span>
              </label>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={installmentsRequested}
                onChange={(e) => setInstallmentsRequested(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-yellow-500"
              />
              <span className="text-sm text-zinc-300">
                {t("installments.requested")}
                <span className="block text-xs text-zinc-500 mt-0.5">{t("installments.note")}</span>
              </span>
            </label>

            {hasBuild && tradeInEstimate && (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-yellow-300">{t("tradeIn.title")}</p>
                  <p className="text-xs text-zinc-500">{t("tradeIn.preliminaryBadge")}</p>
                </div>
                <p className="text-xs text-zinc-400">
                  {t("tradeIn.range", { min: tradeInEstimate.sumMin, max: tradeInEstimate.sumMax })}
                </p>
                <p className="text-sm text-zinc-200">{t("tradeIn.coupon", { amount: tradeInEstimate.couponPLN })}</p>
                <p className="text-xs text-zinc-500">
                  {t("tradeIn.afterDiscount", { amount: totalAfterTradeIn })}
                </p>
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={useTradeInCoupon}
                    onChange={(e) => setUseTradeInCoupon(e.target.checked)}
                  />
                  <span>{t("tradeIn.useCoupon")}</span>
                </label>
                <p className="text-xs text-zinc-500">
                  {t("tradeIn.installmentFromDiscounted", { amount: installmentMonthly })}
                </p>
                <p className="text-[11px] text-zinc-500">{t("tradeIn.disclaimer")}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    isLoading={tradeInSubmitting}
                    onClick={() => {
                      const stored = loadStoredContacts();
                      if (stored?.phone) {
                        void createTradeInRequest(stored);
                        return;
                      }
                      setTradeInContactOpen(true);
                    }}
                  >
                    {t("tradeIn.createRequest")}
                  </Button>
                  {tradeInContactOpen && (
                    <div className="w-full grid sm:grid-cols-2 gap-2 pt-2">
                      <input
                        value={tradeInPhone}
                        onChange={(e) => setTradeInPhone(e.target.value)}
                        placeholder={t("tradeIn.phonePlaceholder")}
                        className={inputClass}
                      />
                      <input
                        value={tradeInMessenger}
                        onChange={(e) => setTradeInMessenger(e.target.value)}
                        placeholder={t("tradeIn.messengerPlaceholder")}
                        className={inputClass}
                      />
                      <div className="sm:col-span-2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          isLoading={tradeInSubmitting}
                          onClick={() => {
                            if (tradeInPhone.trim().length < 8) {
                              toast.error(t("tradeIn.contactRequired"));
                              return;
                            }
                            void createTradeInRequest({
                              phone: tradeInPhone.trim(),
                              messenger: tradeInMessenger.trim() || undefined,
                            });
                          }}
                        >
                          {t("tradeIn.submitContacts")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTradeInContactOpen(false)}
                        >
                          {t("tradeIn.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              {t("submit")}
            </Button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
