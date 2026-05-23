"use client";

import { motion } from "framer-motion";

export function PcIllustration() {
  return (
    <motion.div
      className="relative w-full h-full animate-float"
      style={{ perspective: 1200 }}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-[0_0_60px_rgba(255,215,0,0.3)]"
        fill="none"
      >
        <defs>
          <linearGradient id="pcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#E6B800" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          animate={{ rotateY: [0, 5, 0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="80" y="60" width="240" height="280" rx="12" stroke="url(#pcGrad1)" strokeWidth="2" fill="rgba(12,12,18,0.8)" filter="url(#glow)" />
          <rect x="100" y="80" width="200" height="140" rx="4" fill="rgba(255,215,0,0.12)" stroke="url(#pcGrad1)" strokeWidth="1" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={110 + i * 48}
              y="100"
              width="36"
              height="100"
              rx="2"
              fill="rgba(139,92,246,0.2)"
              stroke="rgba(129,140,248,0.4)"
              strokeWidth="0.5"
            />
          ))}
          <circle cx="200" cy="250" r="24" stroke="url(#pcGrad1)" strokeWidth="1.5" fill="rgba(99,102,241,0.2)" />
          <motion.circle
            cx="200"
            cy="250"
            r="8"
            fill="#818cf8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <rect x="120" y="300" width="160" height="8" rx="2" fill="rgba(99,102,241,0.3)" />
          <line x1="140" y1="340" x2="160" y2="360" stroke="url(#pcGrad1)" strokeWidth="2" />
          <line x1="260" y1="340" x2="240" y2="360" stroke="url(#pcGrad1)" strokeWidth="2" />
          <line x1="160" y1="360" x2="240" y2="360" stroke="url(#pcGrad1)" strokeWidth="2" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="320" cy="120" r="20" stroke="#818cf8" strokeWidth="1" fill="rgba(99,102,241,0.2)" />
          <path d="M312 120 L328 120 M320 112 L320 128" stroke="#a5b4fc" strokeWidth="1.5" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
