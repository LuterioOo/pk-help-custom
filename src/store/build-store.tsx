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
export const DEFAULT_BUILDER_CATEGORY: ComponentCategory = "CASE";

function readCouponFromStorage() {
  const saved = loadTradeInCoupon();
  if (!saved) return { amount: 0, use: false };
  return { amount: Math.round(saved.amount), use: true };
}

interface BuildContextValue {
  selection: BuildSelection;
  activeCategory: ComponentCategory;
  issues: CompatibilityIssue[];
  total: number;
  tradeInCoupon: number;
  useTradeInCoupon: boolean;
  totalAfterTradeIn: number;
  installmentMonthly: number;
  installmentsRequested: boolean;
  selectComponent: (category: ComponentCategory, component: ComponentSpec | null) => void;
  setActiveCategory: (category: ComponentCategory) => void;
  clearBuild: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setTradeInCoupon: (amount: number) => void;
  setUseTradeInCoupon: (enabled: boolean) => void;
  setInstallmentsRequested: (enabled: boolean) => void;
  applyPreset: (components: ComponentSpec[]) => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<BuildSelection>({});
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>(DEFAULT_BUILDER_CATEGORY);
  const initialCoupon = readCouponFromStorage();
  const [tradeInCoupon, setTradeInCouponState] = useState(initialCoupon.amount);
  const [useTradeInCoupon, setUseTradeInCoupon] = useState(initialCoupon.use);
  const [installmentsRequested, setInstallmentsRequested] = useState(false);

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
    setActiveCategory(DEFAULT_BUILDER_CATEGORY);
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

  const applyPreset = useCallback((components: ComponentSpec[]) => {
    setSelection((prev) => {
      const next = { ...prev };
      for (const c of components) {
        next[c.category] = c;
      }
      return next;
    });
    setActiveCategory(DEFAULT_BUILDER_CATEGORY);
  }, []);

  useEffect(() => {
    if (Object.keys(selection).length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      /* ignore */
    }
  }, [selection]);

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
      loadFromStorage,
      saveToStorage,
      setTradeInCoupon,
      setUseTradeInCoupon,
      setInstallmentsRequested,
      applyPreset,
    }),
    [
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
      clearBuild,
      loadFromStorage,
      saveToStorage,
      setTradeInCoupon,
      applyPreset,
    ]
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used within BuildProvider");
  return ctx;
}
