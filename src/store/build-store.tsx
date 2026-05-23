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

const STORAGE_KEY = "pkhelp-build";

interface BuildContextValue {
  selection: BuildSelection;
  issues: CompatibilityIssue[];
  total: number;
  selectComponent: (category: ComponentCategory, component: ComponentSpec | null) => void;
  clearBuild: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<BuildSelection>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelection(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

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

  const value = useMemo(
    () => ({
      selection,
      issues,
      total,
      selectComponent,
      clearBuild,
      loadFromStorage,
      saveToStorage,
    }),
    [selection, issues, total, selectComponent, clearBuild, loadFromStorage, saveToStorage]
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used within BuildProvider");
  return ctx;
}
