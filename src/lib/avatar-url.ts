/** Local disk uploads are not available on Vercel serverless unless committed to git. */
export function isEphemeralLocalUpload(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("/uploads/masters/") || url.startsWith("/uploads/components/");
}

export function shouldRenderStoredAvatar(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  const onVercel = host.endsWith(".vercel.app") || host.includes("vercel.app");
  if (onVercel && isEphemeralLocalUpload(url)) return false;
  return true;
}
