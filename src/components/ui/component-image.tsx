"use client";

import Image from "next/image";
import type { ComponentCategory } from "@prisma/client";
import { getCategoryVisual } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  category?: ComponentCategory;
  className?: string;
  sizes?: string;
};

export function ComponentImage({ src, alt, category, className, sizes = "80px" }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-contain p-1", className)}
        sizes={sizes}
        loading="lazy"
      />
    );
  }

  const { Icon, label, gradient, iconClass } = getCategoryVisual(category);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br",
        gradient,
        className
      )}
      aria-hidden
    >
      <Icon className={cn("w-8 h-8", iconClass)} strokeWidth={1.35} />
      <span className={cn("text-[9px] font-semibold uppercase tracking-wider", iconClass)}>
        {label}
      </span>
    </div>
  );
}
