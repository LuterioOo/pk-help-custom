"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";

function isAdminPath(pathname: string) {
  return /\/admin(\/|$)/.test(pathname);
}

/** Always-visible language control, separate from header/menu. */
export function FloatingLanguageSwitcher() {
  const pathname = usePathname() ?? "";
  if (isAdminPath(pathname)) return null;

  return (
    <div
      className="fixed z-[46] pointer-events-none
        left-2 bottom-[calc(5rem+env(safe-area-inset-bottom))]
        md:left-auto md:bottom-auto md:top-[calc(2.4rem+env(safe-area-inset-top))] md:right-3"
      aria-label="Language"
    >
      <LanguageSwitcher variant="floating" className="pointer-events-auto shadow-lg" />
    </div>
  );
}
