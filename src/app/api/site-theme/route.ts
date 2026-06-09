import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_THEME, isSiteThemeId } from "@/lib/site-theme";

export async function GET() {
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
