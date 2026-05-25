import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getCrmConfig, isCrmConfigured } from "@/lib/crm/config";
import { testKommoConnection } from "@/lib/crm/kommo";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isCrmConfigured()) {
    return NextResponse.json({
      ok: false,
      error: "CRM_ACCESS_TOKEN is not set on the server",
    });
  }

  const config = getCrmConfig()!;
  const result = await testKommoConnection(config);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    apiBase: result.apiBase,
    webBase: result.webBase,
    hint: "If ok is true, submit a test order or use CRM resync on an existing order.",
  });
}
