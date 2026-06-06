"use client";

import { useState } from "react";
import Image from "next/image";
import type { ComponentCategory } from "@prisma/client";
import { getCategoryVisual } from "@/lib/category-icons";
import { resolveImageSrc, shouldUseUnoptimizedImage } from "@/lib/resolve-image-src";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  category?: ComponentCategory;
  className?: string;
  sizes?: string;
};

function CategoryPlaceholder({
  category,
  className,
}: {
  category?: ComponentCategory;
  className?: string;
}) {
  const { Icon, label, gradient, iconClass } = getCategoryVisual(category);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br pointer-events-none",
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

export function ComponentImage({ src, alt, category, className, sizes = "80px" }: Props) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveImageSrc(src);

  if (!resolved || broken) {
    return <CategoryPlaceholder category={category} className={className} />;
  }

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <Image
        src={resolved}
        alt={alt}
        fill
        className={cn("object-contain p-1", className)}
        sizes={sizes}
        loading="lazy"
        unoptimized={shouldUseUnoptimizedImage(resolved)}
        onError={() => setBroken(true)}
      />
    </div>
  );
}
