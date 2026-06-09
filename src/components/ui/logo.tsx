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
  const heights = { xs: 28, sm: 36, md: 48, lg: 56 } as const;
  const h = heights[size];
  const mobileTight = size === "xs";

  const content = (
    <div
      className={cn(
        "inline-flex items-center group transition-transform hover:scale-[1.02] motion-safe:transition-transform",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="PK HELP"
        width={Math.round(h * 3.2)}
        height={h}
        className={cn(
          "relative w-auto object-contain object-left",
          mobileTight ? "h-[28px] w-auto max-w-[100px] min-w-[68px]" : "h-auto"
        )}
        style={mobileTight ? undefined : { height: h }}
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
