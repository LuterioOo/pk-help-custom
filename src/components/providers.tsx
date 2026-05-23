"use client";

import { Toaster } from "sonner";
import { BuildProvider } from "@/store/build-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BuildProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(12, 12, 18, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f4f4f5",
          },
        }}
      />
    </BuildProvider>
  );
}
