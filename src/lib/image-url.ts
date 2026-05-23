const BLOB_HOST_SUFFIX = "blob.vercel-storage.com";

export function isBlobImageUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export function isAllowedStoredImageUrl(url: string, localPrefix: string): boolean {
  if (!url) return true;
  if (url.startsWith(`${localPrefix}/`)) return true;
  if (url.startsWith("https://") || url.startsWith("http://")) {
    try {
      const { protocol, hostname } = new URL(url);
      if (protocol !== "http:" && protocol !== "https:") return false;
      if (hostname.endsWith(BLOB_HOST_SUFFIX)) return true;
      return protocol === "https:";
    } catch {
      return false;
    }
  }
  return false;
}