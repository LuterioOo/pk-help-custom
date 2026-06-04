import path from "path";

export const MASTER_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "masters");
export const MASTER_URL_PREFIX = "/uploads/masters/";
export const MASTER_MAX_BYTES = 4 * 1024 * 1024;
export const MASTER_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function masterExt(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function masterBlobPathname(id: string, ext: string): string {
  return `masters/${id}.${ext}`;
}

export function masterPublicPath(id: string, ext: string): string {
  return `${MASTER_URL_PREFIX}${id}.${ext}`;
}

export async function removeMasterFiles(id: string): Promise<void> {
  const { removeImagesById } = await import("@/lib/image-storage");
  await removeImagesById({
    id,
    blobPrefix: "masters",
    localDir: MASTER_UPLOAD_DIR,
  });
}
