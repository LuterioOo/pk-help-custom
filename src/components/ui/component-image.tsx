"use client";

import Image from "next/image";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

export function ComponentImage({ src, alt, className, sizes = "80px" }: Props) {
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

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-white/5 to-white/[0.02]",
        className
      )}
    >
      <Cpu className="w-8 h-8 text-zinc-600" strokeWidth={1.25} />
      <span className="text-[10px] text-zinc-600 uppercase tracking-wide">PC</span>
    </div>
  );
}