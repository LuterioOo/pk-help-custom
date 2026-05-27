"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const Preloader = dynamic(
  () => import("@/components/ui/preloader").then((m) => ({ default: m.Preloader })),
  { ssr: false }
);

const AnimatedBackground = dynamic(
  () => import("@/components/ui/animated-background").then((m) => ({ default: m.AnimatedBackground })),
  { ssr: false }
);

const ScrollToTop = dynamic(
  () => import("@/components/ui/scroll-to-top").then((m) => ({ default: m.ScrollToTop })),
  { ssr: false }
);

/** Lazy-loaded shell effects — keeps first paint fast. */
export function DeferredChrome() {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const elAtPoint =
        typeof e.clientX === "number" && typeof e.clientY === "number"
          ? (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)
          : null;

      // #region agent log
      fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
        body: JSON.stringify({
          sessionId: "ec767e",
          runId: "pre-fix",
          hypothesisId: "B",
          location: "src/components/layout/deferred-chrome.tsx:useEffect:pointerdown",
          message: "Global pointerdown captured",
          data: {
            x: e.clientX,
            y: e.clientY,
            targetTag: target?.tagName ?? null,
            targetId: target?.id ?? null,
            targetClass: target?.className ? String(target.className).slice(0, 140) : null,
            elAtPointTag: elAtPoint?.tagName ?? null,
            elAtPointId: elAtPoint?.id ?? null,
            elAtPointClass: elAtPoint?.className ? String(elAtPoint.className).slice(0, 140) : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
    };

    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, []);

  return (
    <>
      <Preloader />
      <AnimatedBackground />
      <ScrollToTop />
    </>
  );
}
