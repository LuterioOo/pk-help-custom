import type { CrmConfig } from "@/lib/crm/config";
import { parseKommoJwtPayload } from "@/lib/crm/kommo-jwt";

const RESOLVE_TIMEOUT_MS = 12_000;

export type KommoResolvedEndpoints = {
  apiBase: string;
  webBase: string;
};

let cached: KommoResolvedEndpoints | null = null;

function hostFromUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function buildApiBase(domain: string): string {
  const host = hostFromUrl(domain);
  return `https://${host}/api/v4`;
}

function buildWebBase(subdomain: string): string {
  const sub = subdomain.replace(/^https?:\/\//i, "").replace(/\.kommo\.com.*$/i, "").replace(/\/$/, "");
  return `https://${sub}.kommo.com`;
}

function webBaseFromEnv(): string | null {
  const rawUrl = process.env.CRM_API_URL?.trim();
  if (rawUrl) {
    const host = hostFromUrl(rawUrl);
    if (!/^api[-.]/i.test(host)) {
      return `https://${host}`;
    }
  }
  const sub = process.env.CRM_SUBDOMAIN?.trim();
  if (sub) return buildWebBase(sub);
  return null;
}

function apiBaseFromEnv(): string | null {
  const domain = process.env.CRM_API_DOMAIN?.trim();
  if (domain) return buildApiBase(domain);
  return null;
}

async function fetchAccountSubdomain(
  apiBase: string,
  accessToken: string
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);
  try {
    const res = await fetch(`${apiBase}/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { subdomain?: string };
    return data.subdomain?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves Kommo API host (often api-c.kommo.com) and web UI host ({subdomain}.kommo.com).
 */
export async function resolveKommoEndpoints(
  config: CrmConfig
): Promise<KommoResolvedEndpoints> {
  if (cached) return cached;

  const envWeb = webBaseFromEnv();
  const envApi = apiBaseFromEnv();
  const jwt = parseKommoJwtPayload(config.accessToken);

  // Many Kommo accounts (e.g. lutcasperl) only accept API on {subdomain}.kommo.com,
  // not on api-c.kommo.com from the JWT — prefer env subdomain first.
  if (envWeb) {
    cached = {
      webBase: envWeb,
      apiBase: `${envWeb}/api/v4`,
    };
    return cached;
  }

  if (config.apiUrl && !/^https?:\/\/api[-.]/i.test(config.apiUrl)) {
    const webBase = config.apiUrl.replace(/\/$/, "");
    cached = { webBase, apiBase: `${webBase}/api/v4` };
    return cached;
  }

  const apiBase =
    envApi ??
    (jwt?.api_domain ? buildApiBase(jwt.api_domain) : null);

  if (!apiBase) {
    throw new Error(
      "Set CRM_API_URL=https://yoursubdomain.kommo.com (e.g. https://lutcasperl.kommo.com)"
    );
  }

  let webBase: string | null = null;
  const subdomain = await fetchAccountSubdomain(apiBase, config.accessToken);
  if (subdomain) webBase = buildWebBase(subdomain);

  if (!webBase) {
    throw new Error(
      "Kommo API auth failed. Set CRM_API_URL=https://lutcasperl.kommo.com (your subdomain from the browser)"
    );
  }

  cached = { apiBase: `${webBase}/api/v4`, webBase };
  return cached;
}

export function resetKommoEndpointCache(): void {
  cached = null;
}
