"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 grid-bg opacity-50" />
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-yellow-500/20 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] rounded-full bg-amber-500/15 blur-[140px]"
        animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[100px] animate-pulse-glow"
      />
    </div>
  );
}
