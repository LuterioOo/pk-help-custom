import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_THEME, isSiteThemeId, SITE_THEME_IDS } from "@/lib/site-theme";

const bodySchema = z.object({
  theme: z.enum(SITE_THEME_IDS),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
      select: { colorTheme: true },
    });
    const theme = isSiteThemeId(settings?.colorTheme) ? settings.colorTheme : DEFAULT_SITE_THEME;
    return NextResponse.json({ theme });
  } catch {
    return NextResponse.json({ theme: DEFAULT_SITE_THEME });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: "main" },
      create: { id: "main", colorTheme: parsed.data.theme },
      update: { colorTheme: parsed.data.theme },
    });
    return NextResponse.json({ theme: parsed.data.theme, ok: true });
  } catch (err) {
    console.error("site-theme PATCH", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
