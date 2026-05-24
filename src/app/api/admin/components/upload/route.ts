import { NextRequest, NextResponse } from "next/server";
import { isDatabaseError } from "@/lib/db-config";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isBlobStorageEnabled, saveImageFile } from "@/lib/image-storage";
import {
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_BYTES,
  UPLOAD_DIR,
  componentBlobPathname,
  extensionForMime,
  imagePublicPath,
  removeComponentImageFiles,
} from "@/lib/component-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NODE_ENV === "production" && !isBlobStorageEnabled()) {
    return NextResponse.json(
      {
        error: "Uploads require Vercel Blob. Connect Blob store and set BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 }
    );
  }

  try {
  const formData = await req.formData();
  const file = formData.get("file");
  const componentId = formData.get("componentId");

  if (!(file instanceof File) || typeof componentId !== "string" || !componentId.trim()) {
    return NextResponse.json({ error: "Missing file or componentId" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image too large (max 5 MB)" }, { status: 400 });
  }

  const existing = await prisma.component.findUnique({ where: { id: componentId } });
  if (!existing) {
    return NextResponse.json({ error: "Component not found" }, { status: 404 });
  }

  await removeComponentImageFiles(componentId);

  const ext = extensionForMime(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = await saveImageFile({
    buffer,
    blobPathname: componentBlobPathname(componentId, ext),
    contentType: file.type,
    localDir: UPLOAD_DIR,
    localPublicPath: imagePublicPath(componentId, ext),
  });

  const component = await prisma.component.update({
    where: { id: componentId },
    data: { imageUrl },
  });

  return NextResponse.json({ imageUrl, component });
  } catch (e) {
    console.error("Component upload error:", e);
    if (isDatabaseError(e)) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : "Upload failed";
    const blobHint =
      message.includes("blob") || message.includes("BLOB") || message.includes("token")
        ? " Check Vercel Blob connection and BLOB_READ_WRITE_TOKEN."
        : "";
    return NextResponse.json({ error: `${message}${blobHint}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const componentId = req.nextUrl.searchParams.get("componentId");
  if (!componentId) {
    return NextResponse.json({ error: "Missing componentId" }, { status: 400 });
  }

  await removeComponentImageFiles(componentId);
  const component = await prisma.component.update({
    where: { id: componentId },
    data: { imageUrl: null },
  });

  return NextResponse.json({ success: true, component });
}
