"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, href = "/", size = "md" }: LogoProps) {
  const heights = { sm: 36, md: 44, lg: 56 } as const;
  const h = heights[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center group transition-transform hover:scale-[1.03]",
        className
      )}
    >
      <div className="relative rounded-full border border-yellow-400/40 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-300/5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 shadow-[0_0_24px_rgba(255,215,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-40 mix-blend-screen" />
        <Image
          src="/logo.png"
          alt="PK HELP"
          width={Math.round(h * 3.2)}
          height={h}
          className="relative w-auto object-contain drop-shadow-[0_0_18px_rgba(255,215,0,0.55)]"
          priority={size === "lg"}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 rounded-lg">
        {content}
      </Link>
    );
  }
  return content;
}
