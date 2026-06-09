"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { cn } from "@/lib/utils";

function isHomePath(pathname: string, base: string) {
  return pathname === base || pathname === `${base}/` || pathname === "/";
}

export function ScrollToTop() {
  const t = useTranslations("common");
  const base = useLocaleBase();
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const onHomeMobile = isHomePath(pathname, base);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "fixed z-30 p-3 rounded-xl glass neon-border text-yellow-300 hover:text-white transition-colors touch-manipulation",
            "right-3 md:right-6",
            onHomeMobile
              ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6"
              : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-6"
          )}
          aria-label={t("backTop")}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
