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
      // #region agent log
      fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
        body: JSON.stringify({
          sessionId: "ec767e",
          runId: "pre-fix",
          hypothesisId: "D",
          location: "src/hooks/use-ui-sound.ts:unlock",
          message: "UI sound unlocked by user gesture",
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
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
    (type: "click" | "switch") => {
      // #region agent log
      fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
        body: JSON.stringify({
          sessionId: "ec767e",
          runId: "pre-fix",
          hypothesisId: "D",
          location: "src/hooks/use-ui-sound.ts:playTone",
          message: "playTone called",
          data: { type, muted, unlocked },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      if (muted || !unlocked) return;
      try {
        const AudioContextImpl = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextImpl();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === "click" ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(type === "click" ? 540 : 320, now);
        osc.frequency.exponentialRampToValueAtTime(type === "click" ? 420 : 260, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        setTimeout(() => void ctx.close().catch(() => {}), 180);
      } catch {
        /* ignore */
      }
    },
    [muted, unlocked]
  );

  return { muted, toggleMute, playTone };
}

