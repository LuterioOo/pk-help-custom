"use client";

import { useCallback } from "react";

type ToneType = "click" | "hover" | "select" | "switch" | "notification" | "bell";

/** Public site UI sounds are disabled; admin dashboard uses its own bell implementation. */
export function useUiSound() {
  const playTone: (type: ToneType) => void = () => {
    /* no-op */
  };

  const toggleMute = useCallback(() => {
    /* no-op */
  }, []);

  return { muted: true, toggleMute, playTone };
}
