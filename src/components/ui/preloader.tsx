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
    // #region agent log
    fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
      body: JSON.stringify({
        sessionId: "ec767e",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "src/components/ui/preloader.tsx:useEffect",
        message: "Preloader shown",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    const hide = setTimeout(() => {
      setFade(true);
      // #region agent log
      fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
        body: JSON.stringify({
          sessionId: "ec767e",
          runId: "pre-fix",
          hypothesisId: "C",
          location: "src/components/ui/preloader.tsx:hideTimeout",
          message: "Preloader fade started",
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
        // #region agent log
        fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
          body: JSON.stringify({
            sessionId: "ec767e",
            runId: "pre-fix",
            hypothesisId: "C",
            location: "src/components/ui/preloader.tsx:hideTimeout",
            message: "Preloader hidden",
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion agent log
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
