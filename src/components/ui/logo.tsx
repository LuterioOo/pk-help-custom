"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Logo({ className, href = "/", size = "md" }: LogoProps) {
  const heights = { xs: 28, sm: 40, md: 56, lg: 64 } as const;
  const h = heights[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center group transition-transform hover:scale-[1.03]",
        className
      )}
    >
      <div className="relative px-1.5 py-0.5 sm:px-2 sm:py-1">
        <Image
          src="/logo.png"
          alt="PK HELP"
          width={Math.round(h * 3.2)}
          height={h}
          className="relative w-auto object-contain"
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
