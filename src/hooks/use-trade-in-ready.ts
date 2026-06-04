"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isTradeInBuildUnlocked,
  isTradeInFlowActive,
  loadTradeInCoupon,
  shouldLockBuilderCta,
} from "@/lib/trade-in-storage";

export function useTradeInReady() {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [couponAmount, setCouponAmount] = useState(0);

  const refresh = useCallback(() => {
    const coupon = loadTradeInCoupon();
    setCouponAmount(coupon?.amount ?? 0);
    setReady(isTradeInBuildUnlocked());
    setFlowActive(isTradeInFlowActive());
    setLocked(shouldLockBuilderCta());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("pkhelp-trade-in-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("pkhelp-trade-in-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { ready, locked, flowActive, couponAmount, refresh };
}
