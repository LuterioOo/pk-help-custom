"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveImageSrc } from "@/lib/resolve-image-src";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  objectFit?: "cover" | "contain";
};

/**
 * Admin image preview — native <img> only (no next/image fill).
 * Prevents absolute-positioned overlays from escaping parent bounds on 404.
 */
export function StoredImage({
  src,
  alt = "",
  className,
  objectFit = "cover",
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageSrc(src);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !resolved) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600 pointer-events-none",
          className
        )}
      >
        <ImageOff className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={cn(
        "h-full w-full pointer-events-none",
        objectFit === "contain" ? "object-contain p-0.5" : "object-cover",
        className
      )}
      onError={() => setFailed(true)}
    />
  );
}
