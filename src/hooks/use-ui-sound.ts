"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pkhelp-ui-sound-mute";

export function useUiSound() {
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      setUnlocked(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const playTone = useCallback(
    (type: "click" | "hover" | "select" | "switch") => {
      if (muted || !unlocked) return;
      try {
        const AudioContextImpl = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextImpl();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === "hover" ? "sine" : type === "click" ? "triangle" : type === "select" ? "square" : "sawtooth";

        const startFreq =
          type === "hover" ? 920 : type === "click" ? 540 : type === "select" ? 460 : 320;
        const endFreq =
          type === "hover" ? 820 : type === "click" ? 420 : type === "select" ? 380 : 260;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + (type === "hover" ? 0.045 : 0.08));
        gain.gain.setValueAtTime(0.0001, now);
        const peak = type === "hover" ? 0.08 : type === "select" ? 0.16 : 0.18;
        const dur = type === "hover" ? 0.06 : type === "select" ? 0.09 : 0.11;
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + (type === "hover" ? 0.065 : 0.12));
        setTimeout(() => void ctx.close().catch(() => {}), 180);
      } catch {
        /* ignore */
      }
    },
    [muted, unlocked]
  );

  return { muted, toggleMute, playTone };
}

