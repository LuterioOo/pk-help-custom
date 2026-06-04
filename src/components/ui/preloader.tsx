"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const STORAGE_KEY = "pk-help-preloaded";

function isAdminPath(pathname: string) {
  return /\/admin(\/|$)/.test(pathname);
}

export function Preloader() {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (isAdminPath(pathname)) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setVisible(true);
    let removeTimer: ReturnType<typeof setTimeout> | undefined;
    const hideTimer = setTimeout(() => {
      setFade(true);
      removeTimer = setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
      }, 280);
    }, 650);

    return () => {
      clearTimeout(hideTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] transition-opacity duration-300 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading"
      aria-hidden={fade}
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
