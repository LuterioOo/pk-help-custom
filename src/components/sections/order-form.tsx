"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBuild } from "@/store/build-store";
import { selectionToSelectedComponents } from "@/lib/order-components";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

import {
  saveStoredContacts,
  loadTradeInLead,
  clearTradeInLead,
} from "@/lib/trade-in-storage";

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
  const base = useLocaleBase();
  const {
    selection,
    total,
    tradeInCoupon,
    tradeInUnlocked,
    useTradeInCoupon,
    setUseTradeInCoupon,
    totalAfterTradeIn,
    installmentMonthly,
    installmentsRequested,
    setInstallmentsRequested,
    isBuildComplete,
  } = useBuild();
  const hasBuild = Object.keys(selection).length > 0;

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
  const attachBuild = watch("attachBuild");
  const canAttachBuild = hasBuild && isBuildComplete;

  const storeContacts = (phone: string, messenger?: string) => {
    saveStoredContacts({ phone, messenger });
  };

  const toggleService = (label: string) => {
    const next = selectedServices.includes(label)
      ? selectedServices.filter((s) => s !== label)
      : [...selectedServices, label];
    setValue("services", next);
  };

  useEffect(() => {
    if (attachBuild && !canAttachBuild) {
      setValue("attachBuild", false);
    }
  }, [attachBuild, canAttachBuild, setValue]);

  const onSubmit = async (data: FormData) => {
    if (data.website) return;
    if (data.attachBuild && hasBuild && !isBuildComplete) {
      toast.error(t("completeBuildFirst"));
      return;
    }
    try {
      storeContacts(data.phone, data.messenger);
      const pendingTradeInLead = loadTradeInLead();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingOrderId: pendingTradeInLead?.orderId,
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          messenger: data.messenger,
          services: data.services,
          comment: data.comment,
          buildJson: data.attachBuild && canAttachBuild ? selection : undefined,
          selectedComponents:
            data.attachBuild && canAttachBuild ? selectionToSelectedComponents(selection) : undefined,
          totalPrice: data.attachBuild && canAttachBuild ? (useTradeInCoupon ? totalAfterTradeIn : total) : undefined,
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
          sourceType: pendingTradeInLead?.orderId ? "trade_in" : "builder",
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
      if (pendingTradeInLead?.orderId) {
        clearTradeInLead();
      }
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
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex items-center gap-3",
                    canAttachBuild ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  )}
                >
                  <input
                    type="checkbox"
                    {...register("attachBuild")}
                    disabled={!canAttachBuild}
                    className="w-4 h-4 rounded accent-yellow-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-zinc-400">
                    {t("attachBuild")} ({total.toLocaleString("pl-PL")} PLN)
                  </span>
                </label>
                {!isBuildComplete && (
                  <p className="text-xs text-amber-300/80">{t("completeBuildFirst")}</p>
                )}
              </div>
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

            {tradeInUnlocked && tradeInCoupon > 0 ? (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                <p className="text-sm font-medium text-yellow-300">{t("tradeIn.title")}</p>
                <p className="text-sm text-zinc-200">{t("tradeIn.coupon", { amount: tradeInCoupon })}</p>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTradeInCoupon}
                    onChange={(e) => setUseTradeInCoupon(e.target.checked)}
                    className="accent-theme"
                  />
                  <span>{t("tradeIn.useCoupon")}</span>
                </label>
                {useTradeInCoupon ? (
                  <>
                    <p className="text-xs text-zinc-500">
                      {t("tradeIn.afterDiscount", { amount: totalAfterTradeIn })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t("tradeIn.installmentFromDiscounted", { amount: installmentMonthly })}
                    </p>
                  </>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                {t("tradeIn.hint")}{" "}
                <Link href={`${base}/trade-in`} className="text-yellow-400/90 hover:text-yellow-300 underline-offset-2 hover:underline">
                  {t("tradeIn.goto")}
                </Link>
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              disabled={Boolean(attachBuild && hasBuild && !isBuildComplete)}
            >
              {t("submit")}
            </Button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
