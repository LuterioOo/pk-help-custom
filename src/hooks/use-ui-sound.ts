"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pkhelp-ui-sound-mute";

export function useUiSound() {
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setMuted(raw === "1");
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
          // Subtle glassy hover tick.
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1240, now);
          osc.frequency.exponentialRampToValueAtTime(980, now + 0.025);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.04);
          setTimeout(() => void ctx.close().catch(() => {}), 100);
        } else if (type === "click") {
          // Soft mechanical click: low tap plus a tiny bright snap.
          [
            { freq: 420, to: 170, gain: 0.055, dur: 0.055, type: "triangle" as OscillatorType },
            { freq: 1320, to: 940, gain: 0.014, dur: 0.022, type: "sine" as OscillatorType },
          ].forEach((part) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = part.type;
            osc.frequency.setValueAtTime(part.freq, now);
            osc.frequency.exponentialRampToValueAtTime(part.to, now + part.dur);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(part.gain, now + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + part.dur);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(now);
            osc.stop(now + part.dur + 0.01);
          });
          setTimeout(() => void ctx.close().catch(() => {}), 150);
        } else if (type === "select") {
          // Three tiny ratchet ticks for choosing parts.
          const times = [0, 0.022, 0.045];
          const freqs = [760, 640, 520];
          times.forEach((delay, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freqs[idx], now + delay);
            gain.gain.setValueAtTime(0.0001, now + delay);
            gain.gain.linearRampToValueAtTime(0.032, now + delay + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.015);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.02);
          });
          setTimeout(() => void ctx.close().catch(() => {}), 200);
        } else if (type === "switch") {
          // Quick warm transition tone.
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.11);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.045, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.14);
          setTimeout(() => void ctx.close().catch(() => {}), 250);
        } else if (type === "notification") {
          // Calm two-tone success chime.
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          const gain2 = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(523.25, now); // C5
          gain1.gain.setValueAtTime(0.0001, now);
          gain1.gain.linearRampToValueAtTime(0.055, now + 0.01);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          osc1.connect(gain1);
          gain1.connect(destination);

          osc2.type = "sine";
          osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
          gain2.gain.setValueAtTime(0.0001, now + 0.08);
          gain2.gain.linearRampToValueAtTime(0.06, now + 0.09);
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

