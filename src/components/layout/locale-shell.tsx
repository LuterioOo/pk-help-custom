"use client";

import { usePathname } from "next/navigation";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { FloatingLanguageSwitcher } from "@/components/layout/floating-language-switcher";
import { SupportChatWidget } from "@/components/support/support-chat-widget";

function isAdminPath(pathname: string) {
  return /\/admin(\/|$)/.test(pathname);
}

/** Public site chrome — omitted on admin routes so overlays/header never block CRM UI. */
export function LocaleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isAdminPath(pathname)) {
    return (
      <div className="admin-shell min-h-screen bg-[var(--theme-bg)] relative">
        <div className="admin-content relative z-10 pointer-events-auto">{children}</div>
      </div>
    );
  }

  return (
    <>
      <DeferredChrome />
      <Header />
      <FloatingLanguageSwitcher />
      <main className="relative z-10 min-h-screen pb-[calc(var(--mobile-bottom-cta-height)+env(safe-area-inset-bottom)+24px)] md:pb-0">
        {children}
      </main>
      <MobileStickyCta />
      <SupportChatWidget />
      <Footer />
    </>
  );
}
