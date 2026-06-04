import { NextRequest, NextResponse } from "next/server";
import { getMastersData } from "@/lib/masters-data";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "ru";
  const masters = await getMastersData(locale);
  return NextResponse.json({ masters });
}
