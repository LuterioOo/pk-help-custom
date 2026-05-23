import path from "path";
import { removeImagesById } from "@/lib/image-storage";

export const SHOWCASE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "showcase");
export const SHOWCASE_URL_PREFIX = "/uploads/showcase";
export const SHOWCASE_BLOB_PREFIX = "showcase";

export const SHOWCASE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const SHOWCASE_MAX_BYTES = 8 * 1024 * 1024;

export function showcaseExt(mime: string): string {
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

export function showcasePublicPath(id: string, ext: string): string {
  return `${SHOWCASE_URL_PREFIX}/${id}${ext}`;
}

export function showcaseBlobPathname(id: string, ext: string): string {
  return `${SHOWCASE_BLOB_PREFIX}/${id}${ext}`;
}

export async function removeShowcaseFiles(id: string): Promise<void> {
  await removeImagesById({
    id,
    blobPrefix: SHOWCASE_BLOB_PREFIX,
    localDir: SHOWCASE_UPLOAD_DIR,
  });
}
