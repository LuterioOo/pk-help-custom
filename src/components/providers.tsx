"use client";

import { Toaster } from "sonner";
import { BuildProvider } from "@/store/build-store";
import { SiteThemeProvider } from "@/components/providers/site-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BuildProvider>
      <SiteThemeProvider />
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        closeButton
        visibleToasts={4}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(12, 12, 18, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f4f4f5",
          },
          classNames: {
            toast: "transition-all duration-300 ease-out",
          },
        }}
      />
    </BuildProvider>
  );
}
