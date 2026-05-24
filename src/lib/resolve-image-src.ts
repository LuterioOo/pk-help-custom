import { isBlobImageUrl } from "@/lib/image-url";

/** Normalize stored image URL for next/image and <img>. */
export function resolveImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return null;
}

export function isStoredImageUrl(url: string | null | undefined): boolean {
  return resolveImageSrc(url) !== null;
}

export function shouldUseUnoptimizedImage(src: string): boolean {
  return isBlobImageUrl(src);
}
