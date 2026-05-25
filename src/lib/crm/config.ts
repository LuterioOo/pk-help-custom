import { parseKommoJwtPayload } from "@/lib/crm/kommo-jwt";

export type CrmProvider = "kommo";

export type CrmConfig = {
  provider: CrmProvider;
  /** Legacy / optional web URL from env (subdomain.kommo.com) */
  apiUrl: string;
  accessToken: string;
  pipelineId?: number;
  responsibleUserId?: number;
};

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function getCrmConfig(): CrmConfig | null {
  const accessToken =
    process.env.CRM_ACCESS_TOKEN?.trim() || process.env.CRM_API_KEY?.trim();

  if (!accessToken) return null;

  const rawSub = process.env.CRM_SUBDOMAIN?.trim();
  const apiUrl =
    process.env.CRM_API_URL?.trim().replace(/\/$/, "") ||
    (rawSub
      ? `https://${rawSub.replace(/^https?:\/\//i, "").replace(/\.kommo\.com.*$/i, "")}.kommo.com`
      : "");

  const provider = (process.env.CRM_PROVIDER?.trim().toLowerCase() || "kommo") as CrmProvider;
  if (provider !== "kommo") {
    console.warn(`CRM provider "${provider}" is not supported; skipping CRM sync`);
    return null;
  }

  const jwt = parseKommoJwtPayload(accessToken);
  const responsibleUserId =
    parsePositiveInt(process.env.CRM_RESPONSIBLE_USER_ID) ??
    (jwt?.sub ? parsePositiveInt(jwt.sub) : undefined);

  return {
    provider,
    apiUrl,
    accessToken,
    pipelineId: parsePositiveInt(process.env.CRM_PIPELINE_ID),
    responsibleUserId,
  };
}

export function isCrmConfigured(): boolean {
  return getCrmConfig() !== null;
}
