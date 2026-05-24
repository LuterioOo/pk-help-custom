"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";

const STORAGE_KEY = "pk-help-preloaded";

export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
    const hide = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
      }, 280);
    }, 650);
    return () => clearTimeout(hide);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] transition-opacity duration-300 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading"
    >
      <Logo href={undefined} size="lg" />
      <div className="mt-8 h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-700 ease-out"
          style={{ width: fade ? "100%" : "85%" }}
        />
      </div>
    </div>
  );
}
