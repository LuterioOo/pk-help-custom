"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ComponentCategory } from "@prisma/client";
import {
  checkCompatibility,
  getTotalPrice,
  type BuildSelection,
  type ComponentSpec,
  type CompatibilityIssue,
} from "@/lib/compatibility";
import { loadTradeInCoupon } from "@/lib/trade-in-storage";

const STORAGE_KEY = "pkhelp-build";

function readCouponFromStorage() {
  const saved = loadTradeInCoupon();
  if (!saved) return { amount: 0, use: false };
  return { amount: Math.round(saved.amount), use: true };
}

interface BuildContextValue {
  selection: BuildSelection;
  issues: CompatibilityIssue[];
  total: number;
  tradeInCoupon: number;
  useTradeInCoupon: boolean;
  totalAfterTradeIn: number;
  installmentMonthly: number;
  selectComponent: (category: ComponentCategory, component: ComponentSpec | null) => void;
  clearBuild: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setTradeInCoupon: (amount: number) => void;
  setUseTradeInCoupon: (enabled: boolean) => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<BuildSelection>({});
  const initialCoupon = readCouponFromStorage();
  const [tradeInCoupon, setTradeInCouponState] = useState(initialCoupon.amount);
  const [useTradeInCoupon, setUseTradeInCoupon] = useState(initialCoupon.use);

  const syncCouponFromStorage = useCallback(() => {
    const { amount, use } = readCouponFromStorage();
    setTradeInCouponState(amount);
    setUseTradeInCoupon(use);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelection(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    syncCouponFromStorage();
    const onCouponUpdate = () => syncCouponFromStorage();
    window.addEventListener("pkhelp-trade-in-updated", onCouponUpdate);
    window.addEventListener("storage", onCouponUpdate);
    return () => {
      window.removeEventListener("pkhelp-trade-in-updated", onCouponUpdate);
      window.removeEventListener("storage", onCouponUpdate);
    };
  }, [syncCouponFromStorage]);

  const selectComponent = useCallback(
    (category: ComponentCategory, component: ComponentSpec | null) => {
      setSelection((prev) => {
        const next = { ...prev };
        if (component) next[category] = component;
        else delete next[category];
        return next;
      });
    },
    []
  );

  const clearBuild = useCallback(() => {
    setSelection({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setTradeInCoupon = useCallback((amount: number) => {
    setTradeInCouponState(Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0);
  }, []);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  }, [selection]);

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelection(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const issues = useMemo(() => checkCompatibility(selection), [selection]);
  const total = useMemo(() => getTotalPrice(selection), [selection]);
  const totalAfterTradeIn = useMemo(
    () => Math.max(0, total - (useTradeInCoupon ? tradeInCoupon : 0)),
    [total, useTradeInCoupon, tradeInCoupon]
  );
  const installmentMonthly = useMemo(
    () => Math.round((totalAfterTradeIn / 12) * 100) / 100,
    [totalAfterTradeIn]
  );

  const value = useMemo(
    () => ({
      selection,
      issues,
      total,
      tradeInCoupon,
      useTradeInCoupon,
      totalAfterTradeIn,
      installmentMonthly,
      selectComponent,
      clearBuild,
      loadFromStorage,
      saveToStorage,
      setTradeInCoupon,
      setUseTradeInCoupon,
    }),
    [
      selection,
      issues,
      total,
      tradeInCoupon,
      useTradeInCoupon,
      totalAfterTradeIn,
      installmentMonthly,
      selectComponent,
      clearBuild,
      loadFromStorage,
      saveToStorage,
      setTradeInCoupon,
    ]
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used within BuildProvider");
  return ctx;
}
