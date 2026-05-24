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
    <div className={cn("flex items-center group transition-transform hover:scale-[1.03]", className)}>
      <Image
        src="/logo.png"
        alt="PK HELP"
        width={Math.round(h * 3.2)}
        height={h}
        className="w-auto object-contain drop-shadow-[0_0_18px_rgba(255,215,0,0.35)]"
        priority={size === "lg"}
      />
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
