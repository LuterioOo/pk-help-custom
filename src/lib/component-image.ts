import path from "path";
import { removeImagesById } from "@/lib/image-storage";
import { isBlobImageUrl } from "@/lib/image-url";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "components");
export const UPLOAD_URL_PREFIX = "/uploads/components";
export const COMPONENT_BLOB_PREFIX = "components";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
}

export function isLocalComponentImage(url: string): boolean {
  return url.startsWith(`${UPLOAD_URL_PREFIX}/`) || isBlobImageUrl(url);
}

export function imagePublicPath(componentId: string, ext: string): string {
  return `${UPLOAD_URL_PREFIX}/${componentId}${ext}`;
}

export function componentBlobPathname(componentId: string, ext: string): string {
  return `${COMPONENT_BLOB_PREFIX}/${componentId}${ext}`;
}

export async function removeComponentImageFiles(componentId: string): Promise<void> {
  await removeImagesById({
    id: componentId,
    blobPrefix: COMPONENT_BLOB_PREFIX,
    localDir: UPLOAD_DIR,
  });
}
