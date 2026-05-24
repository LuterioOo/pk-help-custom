"use client";

/** CSS-only background — no framer-motion, lower GPU use on mobile. */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="blob-orb blob-orb-a" />
      <div className="blob-orb blob-orb-b" />
      <div className="blob-orb blob-orb-c" />
    </div>
  );
}
