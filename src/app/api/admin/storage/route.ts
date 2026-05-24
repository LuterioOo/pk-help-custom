import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isBlobStorageEnabled } from "@/lib/image-storage";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blob = isBlobStorageEnabled();
  const tokenSet = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  return NextResponse.json({
    blob,
    tokenSet,
    nodeEnv: process.env.NODE_ENV,
    productionUploads: blob || process.env.NODE_ENV !== "production",
    hint: blob
      ? "Vercel Blob connected — uploads work."
      : tokenSet
        ? "BLOB_READ_WRITE_TOKEN is set but invalid. Re-connect Blob in Vercel → Storage."
        : "Connect Vercel Blob (BLOB_READ_WRITE_TOKEN) or use /uploads/showcase/ URLs from git.",
  });
}
