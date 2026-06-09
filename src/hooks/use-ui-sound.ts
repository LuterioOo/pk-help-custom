"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pkhelp-ui-sound-mute";

export function useUiSound() {
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "0") setMuted(false);
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
    (type: "click" | "hover" | "select" | "switch" | "notification" | "bell") => {
      if (muted || !unlocked) return;
      try {
        const AudioContextImpl = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextImpl();
        const now = ctx.currentTime;
        const destination = ctx.destination;

        if (type === "hover") {
          // Subtle, quiet high-frequency tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1600, now);
          osc.frequency.exponentialRampToValueAtTime(1100, now + 0.02);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.015, now + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.03);
          setTimeout(() => void ctx.close().catch(() => {}), 100);
        } else if (type === "click") {
          // Short, solid triangle click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.08);
          setTimeout(() => void ctx.close().catch(() => {}), 150);
        } else if (type === "select") {
          // Satisfying physical ratchet: 3 rapid ticks spaced in time
          const times = [0, 0.025, 0.05];
          const freqs = [820, 700, 580];
          times.forEach((delay, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freqs[idx], now + delay);
            gain.gain.setValueAtTime(0.0001, now + delay);
            gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.015);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.02);
          });
          setTimeout(() => void ctx.close().catch(() => {}), 200);
        } else if (type === "switch") {
          // Quick sliding transition tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.14);
          setTimeout(() => void ctx.close().catch(() => {}), 250);
        } else if (type === "notification") {
          // Futuristic two-tone rising chime
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          const gain2 = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(523.25, now); // C5
          gain1.gain.setValueAtTime(0.0001, now);
          gain1.gain.linearRampToValueAtTime(0.1, now + 0.01);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          osc1.connect(gain1);
          gain1.connect(destination);

          osc2.type = "sine";
          osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
          gain2.gain.setValueAtTime(0.0001, now + 0.08);
          gain2.gain.linearRampToValueAtTime(0.1, now + 0.09);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc2.connect(gain2);
          gain2.connect(destination);

          osc1.start(now);
          osc1.stop(now + 0.18);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.32);

          setTimeout(() => void ctx.close().catch(() => {}), 450);
        } else if (type === "bell") {
          // Rich, resonant metallic CRM bell
          const partials = [880, 1200, 1540, 1980];
          const weights = [0.22, 0.11, 0.06, 0.03];

          partials.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(weights[idx], now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(now);
            osc.stop(now + 1.6);
          });
          setTimeout(() => void ctx.close().catch(() => {}), 1700);
        }
      } catch {
        /* ignore */
      }
    },
    [muted, unlocked]
  );

  return { muted, toggleMute, playTone };
}

