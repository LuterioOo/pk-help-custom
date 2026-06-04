import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isDatabaseError } from "@/lib/db-config";
import { isBlobStorageEnabled, saveImageFile } from "@/lib/image-storage";
import {
  MASTER_MAX_BYTES,
  MASTER_MIME,
  MASTER_UPLOAD_DIR,
  masterBlobPathname,
  masterExt,
  masterPublicPath,
  removeMasterFiles,
} from "@/lib/master-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NODE_ENV === "production" && !isBlobStorageEnabled()) {
    return NextResponse.json(
      { error: "Vercel Blob required for avatar uploads in production.", code: "BLOB_REQUIRED" },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const masterId = formData.get("masterId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!MASTER_MIME.has(file.type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }
    if (file.size > MASTER_MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 4 MB)" }, { status: 400 });
    }

    let id = typeof masterId === "string" && masterId ? masterId : null;
    if (id) {
      const existing = await prisma.master.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await removeMasterFiles(id);
    } else {
      const draft = await prisma.master.create({
        data: { name: "Draft", active: false },
      });
      id = draft.id;
    }

    const ext = masterExt(file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const avatarUrl = await saveImageFile({
      buffer,
      blobPathname: masterBlobPathname(id, ext),
      contentType: file.type,
      localDir: MASTER_UPLOAD_DIR,
      localPublicPath: masterPublicPath(id, ext),
    });

    const master = await prisma.master.update({
      where: { id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl, master });
  } catch (e) {
    console.error("Master upload error:", e);
    if (isDatabaseError(e)) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const masterId = req.nextUrl.searchParams.get("masterId");
  if (!masterId) return NextResponse.json({ error: "Missing masterId" }, { status: 400 });

  await removeMasterFiles(masterId);
  await prisma.master.update({ where: { id: masterId }, data: { avatarUrl: null } });
  return NextResponse.json({ success: true });
}
