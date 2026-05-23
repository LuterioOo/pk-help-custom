import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isDatabaseError } from "@/lib/db-config";
import { isBlobStorageEnabled, saveImageFile } from "@/lib/image-storage";
import {
  SHOWCASE_MAX_BYTES,
  SHOWCASE_MIME,
  SHOWCASE_UPLOAD_DIR,
  removeShowcaseFiles,
  showcaseBlobPathname,
  showcaseExt,
  showcasePublicPath,
} from "@/lib/showcase-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NODE_ENV === "production" && !isBlobStorageEnabled()) {
    return NextResponse.json(
      { error: "Uploads require Vercel Blob (BLOB_READ_WRITE_TOKEN)." },
      { status: 503 }
    );
  }

  try {
  const formData = await req.formData();
  const file = formData.get("file");
  const showcaseId = formData.get("showcaseId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!SHOWCASE_MIME.has(file.type)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }
  if (file.size > SHOWCASE_MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8 MB)" }, { status: 400 });
  }

  let id = typeof showcaseId === "string" && showcaseId ? showcaseId : null;
  let item;

  if (id) {
    const existing = await prisma.showcaseBuild.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await removeShowcaseFiles(id);
  } else {
    item = await prisma.showcaseBuild.create({
      data: { imageUrl: null, active: false },
    });
    id = item.id;
  }

  const ext = showcaseExt(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = await saveImageFile({
    buffer,
    blobPathname: showcaseBlobPathname(id, ext),
    contentType: file.type,
    localDir: SHOWCASE_UPLOAD_DIR,
    localPublicPath: showcasePublicPath(id, ext),
  });

  item = await prisma.showcaseBuild.update({
    where: { id },
    data: { imageUrl },
  });

  return NextResponse.json({ imageUrl, item });
  } catch (e) {
    console.error("Showcase upload error:", e);
    if (isDatabaseError(e)) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("showcaseId");
  if (!id) return NextResponse.json({ error: "Missing showcaseId" }, { status: 400 });
  await removeShowcaseFiles(id);
  await prisma.showcaseBuild.update({ where: { id }, data: { imageUrl: null } });
  return NextResponse.json({ success: true });
}
