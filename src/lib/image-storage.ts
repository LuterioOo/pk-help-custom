import { del, list, put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveImageFile(options: {
  buffer: Buffer;
  blobPathname: string;
  contentType: string;
  localDir: string;
  localPublicPath: string;
}): Promise<string> {
  if (isBlobStorageEnabled()) {
    const blob = await put(options.blobPathname, options.buffer, {
      access: "public",
      contentType: options.contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await fs.mkdir(options.localDir, { recursive: true });
  const filename = path.basename(options.blobPathname);
  await fs.writeFile(path.join(options.localDir, filename), options.buffer);
  return options.localPublicPath;
}

export async function removeImagesById(options: {
  id: string;
  blobPrefix: string;
  localDir: string;
}): Promise<void> {
  if (isBlobStorageEnabled()) {
    const { blobs } = await list({ prefix: `${options.blobPrefix}/${options.id}` });
    if (blobs.length > 0) {
      await del(blobs.map((b) => b.url));
    }
    return;
  }

  const files = await fs.readdir(options.localDir).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((name) => name.startsWith(`${options.id}.`))
      .map((name) => fs.unlink(path.join(options.localDir, name)).catch(() => undefined))
  );
}

export async function removeImageByUrl(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || !isBlobStorageEnabled()) return;
  if (!imageUrl.includes("blob.vercel-storage.com")) return;
  try {
    await del(imageUrl);
  } catch {
    /* ignore missing blob */
  }
}