"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import { resolveImageSrc, shouldUseUnoptimizedImage } from "@/lib/resolve-image-src";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
};

export function ShowcaseImage({ src, alt, className, sizes = "33vw", fill = true }: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageSrc(src);

  if (failed || !resolved) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800/80 to-black/90",
          className
        )}
      >
        <Images className="w-10 h-10 text-zinc-600" strokeWidth={1.25} />
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">PC build</span>
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      sizes={sizes}
      unoptimized={shouldUseUnoptimizedImage(resolved)}
      onError={() => setFailed(true)}
    />
  );
}
