import path from "path";

export const MASTER_BUILD_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "master-builds"
);
export const MASTER_BUILD_URL_PREFIX = "/uploads/master-builds/";
export const MASTER_BUILD_MAX_BYTES = 8 * 1024 * 1024;
export const MASTER_BUILD_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function masterBuildExt(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function masterBuildBlobPathname(id: string, ext: string): string {
  return `master-builds/${id}.${ext}`;
}

export function masterBuildPublicPath(id: string, ext: string): string {
  return `${MASTER_BUILD_URL_PREFIX}${id}.${ext}`;
}

export async function removeMasterBuildFiles(id: string): Promise<void> {
  const { removeImagesById } = await import("@/lib/image-storage");
  await removeImagesById({
    id,
    blobPrefix: "master-builds",
    localDir: MASTER_BUILD_UPLOAD_DIR,
  });
}
