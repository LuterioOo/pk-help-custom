"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocaleBase } from "@/hooks/use-locale-base";
import { ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function isHomePath(pathname: string, base: string) {
  return pathname === base || pathname === `${base}/` || pathname === "/";
}

export function MobileStickyCta() {
  const t = useTranslations("hero");
  const base = useLocaleBase();
  const pathname = usePathname() ?? "";
  const [builderInView, setBuilderInView] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const el = document.getElementById("builder");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBuilderInView(entry.isIntersecting && entry.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.5] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onOpen = () => setChatOpen(true);
    const onClose = () => setChatOpen(false);
    window.addEventListener("pkhelp-support-open", onOpen);
    window.addEventListener("pkhelp-support-close", onClose);
    return () => {
      window.removeEventListener("pkhelp-support-open", onOpen);
      window.removeEventListener("pkhelp-support-close", onClose);
    };
  }, []);

  if (!isHomePath(pathname, base)) return null;
  if (builderInView || chatOpen) return null;

  const openChat = () => window.dispatchEvent(new Event("pkhelp-open-support"));

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1 pointer-events-none bottom-cta-enter"
      aria-hidden={false}
    >
      <div className="pointer-events-auto max-w-lg mx-auto glass-strong rounded-lg border border-yellow-500/15 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] p-0.5 grid grid-cols-[1.35fr_1fr_1fr] gap-0.5">
        <Link
          href={`${base}#builder`}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-bold min-h-[36px]",
            "btn-theme-primary tap-scale"
          )}
        >
          {t("ctaBuild")}
          <ArrowRight className="w-3 h-3 shrink-0" />
        </Link>
        <Link
          href={`${base}/trade-in`}
          className="tap-scale flex flex-col items-center justify-center gap-0 rounded-md px-1 py-1.5 text-[9px] font-medium text-yellow-400/95 bg-white/[0.04] border border-white/10 min-h-[36px]"
        >
          <RefreshCw className="w-3 h-3" />
          {t("ctaTradeInPage")}
        </Link>
        <button
          type="button"
          onClick={openChat}
          className="tap-scale flex flex-col items-center justify-center gap-0 rounded-md px-1 py-1.5 text-[9px] font-medium text-zinc-300 bg-white/[0.04] border border-white/10 min-h-[36px]"
        >
          <MessageSquare className="w-3 h-3" />
          {t("ctaContact")}
        </button>
      </div>
    </div>
  );
}
