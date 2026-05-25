import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { syncOrderToCrm } from "@/lib/crm";

const bodySchema = z.object({
  id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = bodySchema.parse(await req.json());
    const result = await syncOrderToCrm(id, { force: true });

    if (result.ok && result.skipped) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "CRM is not configured (set CRM_ACCESS_TOKEN on Vercel)",
      });
    }

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      leadId: result.leadId,
      dealUrl: result.dealUrl,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("CRM manual sync error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
