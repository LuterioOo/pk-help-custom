"use client";

import dynamic from "next/dynamic";

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
  return (
    <>
      <Preloader />
      <AnimatedBackground />
      <ScrollToTop />
    </>
  );
}
