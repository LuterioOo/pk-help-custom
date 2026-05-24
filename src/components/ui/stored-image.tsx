"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { resolveImageSrc, shouldUseUnoptimizedImage } from "@/lib/resolve-image-src";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  objectFit?: "cover" | "contain";
};

/** Admin previews — fallback on 404 / invalid URL. */
export function StoredImage({
  src,
  alt = "",
  className,
  sizes = "160px",
  objectFit = "cover",
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageSrc(src);

  if (failed || !resolved) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/50 text-zinc-600",
          className
        )}
      >
        <ImageOff className="w-8 h-8" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      className={cn(objectFit === "contain" ? "object-contain p-1" : "object-cover", className)}
      sizes={sizes}
      unoptimized={shouldUseUnoptimizedImage(resolved)}
      onError={() => setFailed(true)}
    />
  );
}
