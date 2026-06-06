"use client";

import { usePathname } from "next/navigation";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function isAdminPath(pathname: string) {
  return /\/admin(\/|$)/.test(pathname);
}

/** Public site chrome — omitted on admin routes so overlays/header never block CRM UI. */
export function LocaleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isAdminPath(pathname)) {
    return (
      <div className="min-h-screen bg-[#050508] relative isolate">{children}</div>
    );
  }

  return (
    <>
      <DeferredChrome />
      <Header />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
