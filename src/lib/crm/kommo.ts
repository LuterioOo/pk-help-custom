import type { Order } from "@prisma/client";
import type { CrmConfig } from "@/lib/crm/config";
import { buildLeadTitle, formatOrderCrmNote } from "@/lib/crm/format-order";
import { resolveKommoEndpoints, type KommoResolvedEndpoints } from "@/lib/crm/kommo-resolve";

const CRM_TIMEOUT_MS = 15_000;

type KommoLeadPayload = Record<string, unknown>;

export type KommoSyncResult = {
  leadId: number;
  dealUrl: string;
};

async function kommoRequest<T>(
  endpoints: KommoResolvedEndpoints,
  accessToken: string,
  path: string,
  init: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);

  try {
    const res = await fetch(`${endpoints.apiBase}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const detail = formatKommoError(data, text, res.status);
      return { ok: false, error: detail, status: res.status };
    }

    return { ok: true, data: data as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

function formatKommoError(data: unknown, text: string, status: number): string {
  if (typeof data === "object" && data) {
    const obj = data as Record<string, unknown>;
    if ("validation-errors" in obj) {
      return `Kommo API ${status}: ${JSON.stringify(obj["validation-errors"]).slice(0, 800)}`;
    }
    if ("detail" in obj) return `Kommo API ${status}: ${String(obj.detail)}`;
    if ("title" in obj) return `Kommo API ${status}: ${String(obj.title)}`;
    if ("errors" in obj) return `Kommo API ${status}: ${JSON.stringify(obj.errors).slice(0, 800)}`;
  }
  return `Kommo API ${status}: ${text.slice(0, 500) || "request failed"}`;
}

function buildDealUrl(webBase: string, leadId: number): string {
  return `${webBase.replace(/\/$/, "")}/leads/detail/${leadId}`;
}

/** Simple lead body — without embedded contacts (avoids 400 on /leads). */
function buildLeadPayload(config: CrmConfig, order: Order): KommoLeadPayload[] {
  const lead: KommoLeadPayload = {
    name: buildLeadTitle(order),
  };

  if (order.totalPrice != null && Number.isFinite(order.totalPrice) && order.totalPrice > 0) {
    lead.price = Math.round(order.totalPrice);
  }
  if (config.pipelineId) lead.pipeline_id = config.pipelineId;
  if (config.responsibleUserId) lead.responsible_user_id = config.responsibleUserId;

  return [lead];
}

async function addLeadNote(
  endpoints: KommoResolvedEndpoints,
  accessToken: string,
  leadId: number,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const result = await kommoRequest<unknown>(
    endpoints,
    accessToken,
    `/leads/${leadId}/notes`,
    {
      method: "POST",
      body: JSON.stringify([
        {
          note_type: "common",
          params: { text },
        },
      ]),
    }
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function createKommoLead(
  config: CrmConfig,
  order: Order,
  extra?: { source?: string }
): Promise<{ ok: true; result: KommoSyncResult } | { ok: false; error: string }> {
  let endpoints: KommoResolvedEndpoints;
  try {
    endpoints = await resolveKommoEndpoints(config);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }

  const createResult = await kommoRequest<{
    _embedded?: { leads?: Array<{ id: number }> };
  }>(endpoints, config.accessToken, "/leads", {
    method: "POST",
    body: JSON.stringify(buildLeadPayload(config, order)),
  });

  if (!createResult.ok) return { ok: false, error: createResult.error };

  const leadId = createResult.data._embedded?.leads?.[0]?.id;
  if (!leadId) {
    return { ok: false, error: "Kommo API: lead id missing in response" };
  }

  const note = formatOrderCrmNote(order, extra);
  const noteResult = await addLeadNote(endpoints, config.accessToken, leadId, note);
  if (!noteResult.ok) {
    console.warn("Kommo lead created but note failed:", noteResult.error);
  }

  return {
    ok: true,
    result: {
      leadId,
      dealUrl: buildDealUrl(endpoints.webBase, leadId),
    },
  };
}

export async function appendKommoLeadNote(
  config: CrmConfig,
  leadId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const id = Number.parseInt(leadId, 10);
  if (!Number.isFinite(id)) return { ok: false, error: "Invalid lead id" };

  let endpoints: KommoResolvedEndpoints;
  try {
    endpoints = await resolveKommoEndpoints(config);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return addLeadNote(endpoints, config.accessToken, id, text);
}

export async function updateKommoLeadStatusNote(
  config: CrmConfig,
  leadId: string,
  order: Order
): Promise<void> {
  const { buildAdminOrderUrl } = await import("@/lib/crm/format-order");
  const note = `Статус заявки обновлён: ${order.status}\n${buildAdminOrderUrl(order.id)}`;
  const result = await appendKommoLeadNote(config, leadId, note);
  if (!result.ok) {
    console.warn("Kommo status note failed:", result.error);
  }
}

export async function resyncKommoLead(
  config: CrmConfig,
  order: Order,
  leadId: string,
  extra?: { source?: string }
): Promise<{ ok: true; result: KommoSyncResult } | { ok: false; error: string }> {
  const id = Number.parseInt(leadId, 10);
  if (!Number.isFinite(id)) {
    return { ok: false, error: "Invalid CRM lead id" };
  }

  let endpoints: KommoResolvedEndpoints;
  try {
    endpoints = await resolveKommoEndpoints(config);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }

  const patchBody: KommoLeadPayload = {
    name: buildLeadTitle(order),
  };
  if (order.totalPrice != null && Number.isFinite(order.totalPrice) && order.totalPrice > 0) {
    patchBody.price = Math.round(order.totalPrice);
  }

  const patchResult = await kommoRequest<unknown>(
    endpoints,
    config.accessToken,
    `/leads/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(patchBody),
    }
  );
  if (!patchResult.ok) {
    return { ok: false, error: patchResult.error };
  }

  const note = `Обновление заявки с сайта:\n\n${formatOrderCrmNote(order, extra)}`;
  const noteResult = await addLeadNote(endpoints, config.accessToken, id, note);
  if (!noteResult.ok) {
    console.warn("Kommo resync note failed:", noteResult.error);
  }

  return {
    ok: true,
    result: {
      leadId: id,
      dealUrl: buildDealUrl(endpoints.webBase, id),
    },
  };
}

/** Ping Kommo API (for admin diagnostics). */
export async function testKommoConnection(
  config: CrmConfig
): Promise<{ ok: true; webBase: string; apiBase: string } | { ok: false; error: string }> {
  try {
    const endpoints = await resolveKommoEndpoints(config);
    const result = await kommoRequest<{ id?: number; name?: string }>(
      endpoints,
      config.accessToken,
      "/account",
      { method: "GET" }
    );
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, webBase: endpoints.webBase, apiBase: endpoints.apiBase };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
