import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isDatabaseError } from "@/lib/db-config";
import { isBlobStorageEnabled, saveImageFile } from "@/lib/image-storage";
import {
  MASTER_BUILD_MAX_BYTES,
  MASTER_BUILD_MIME,
  MASTER_BUILD_UPLOAD_DIR,
  masterBuildBlobPathname,
  masterBuildExt,
  masterBuildPublicPath,
  removeMasterBuildFiles,
} from "@/lib/master-build-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NODE_ENV === "production" && !isBlobStorageEnabled()) {
    return NextResponse.json(
      {
        error: "Vercel Blob required for build image uploads in production.",
        code: "BLOB_REQUIRED",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const buildId = formData.get("buildId");
    const masterId = formData.get("masterId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!MASTER_BUILD_MIME.has(file.type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }
    if (file.size > MASTER_BUILD_MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 8 MB)" }, { status: 400 });
    }

    let id = typeof buildId === "string" && buildId ? buildId : null;
    let build;

    if (id) {
      const existing = await prisma.masterBuild.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await removeMasterBuildFiles(id);
    } else {
      const mid = typeof masterId === "string" && masterId ? masterId : null;
      if (!mid) {
        return NextResponse.json({ error: "Missing masterId for new build" }, { status: 400 });
      }
      const master = await prisma.master.findUnique({ where: { id: mid } });
      if (!master) return NextResponse.json({ error: "Master not found" }, { status: 404 });

      build = await prisma.masterBuild.create({
        data: {
          masterId: mid,
          title: "Draft",
          active: false,
        },
      });
      id = build.id;
    }

    const ext = masterBuildExt(file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await saveImageFile({
      buffer,
      blobPathname: masterBuildBlobPathname(id, ext),
      contentType: file.type,
      localDir: MASTER_BUILD_UPLOAD_DIR,
      localPublicPath: masterBuildPublicPath(id, ext),
    });

    build = await prisma.masterBuild.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json({ imageUrl, build });
  } catch (e) {
    console.error("Master build upload error:", e);
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

  const buildId = req.nextUrl.searchParams.get("buildId");
  if (!buildId) return NextResponse.json({ error: "Missing buildId" }, { status: 400 });

  await removeMasterBuildFiles(buildId);
  await prisma.masterBuild.update({ where: { id: buildId }, data: { imageUrl: null } });
  return NextResponse.json({ success: true });
}
