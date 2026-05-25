import { CrmSyncStatus, type Order } from "@prisma/client";
import { getCrmConfig } from "@/lib/crm/config";
import {
  createKommoLead,
  resyncKommoLead,
  updateKommoLeadStatusNote,
} from "@/lib/crm/kommo";
import { prisma } from "@/lib/prisma";

export { isCrmConfigured, getCrmConfig } from "@/lib/crm/config";
export { buildAdminOrderUrl } from "@/lib/crm/format-order";

export type SyncOrderCrmOptions = {
  source?: string;
  force?: boolean;
};

export type SyncOrderCrmResult =
  | { ok: true; skipped?: false; leadId: string; dealUrl: string }
  | { ok: true; skipped: true }
  | { ok: false; error: string };

async function markCrmSkipped(orderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      crmSyncStatus: CrmSyncStatus.SKIPPED,
      crmSyncError: null,
      crmSyncedAt: new Date(),
    },
  });
}

async function markCrmFailed(orderId: string, error: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      crmSyncStatus: CrmSyncStatus.FAILED,
      crmSyncError: error.slice(0, 2000),
      crmSyncedAt: new Date(),
    },
  });
}

async function markCrmSynced(
  orderId: string,
  leadId: string,
  dealUrl: string
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      crmLeadId: leadId,
      crmDealId: leadId,
      crmDealUrl: dealUrl,
      crmSyncStatus: CrmSyncStatus.SYNCED,
      crmSyncError: null,
      crmSyncedAt: new Date(),
    },
  });
}

/**
 * Creates or re-syncs a CRM lead for an order. Never throws — safe to call after order create.
 */
export async function syncOrderToCrm(
  orderId: string,
  options: SyncOrderCrmOptions = {}
): Promise<SyncOrderCrmResult> {
  const config = getCrmConfig();
  if (!config) {
    await markCrmSkipped(orderId).catch((e) =>
      console.error("CRM skip update failed", e)
    );
    return { ok: true, skipped: true };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "Order not found" };
  }

  if (order.crmLeadId && order.crmSyncStatus === CrmSyncStatus.SYNCED && !options.force) {
    return {
      ok: true,
      leadId: order.crmLeadId,
      dealUrl: order.crmDealUrl ?? "",
    };
  }

  try {
    const useExisting =
      order.crmLeadId &&
      (options.force || order.crmSyncStatus === CrmSyncStatus.SYNCED);

    const result = useExisting
      ? await resyncKommoLead(config, order, order.crmLeadId!, { source: options.source })
      : await createKommoLead(config, order, { source: options.source });

    if (!result.ok) {
      await markCrmFailed(orderId, result.error);
      console.error("CRM sync failed for order", orderId, result.error);
      return { ok: false, error: result.error };
    }

    const leadId = String(result.result.leadId);
    await markCrmSynced(orderId, leadId, result.result.dealUrl);
    return { ok: true, leadId, dealUrl: result.result.dealUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markCrmFailed(orderId, message).catch((e) =>
      console.error("CRM failed status update error", e)
    );
    console.error("CRM sync error for order", orderId, err);
    return { ok: false, error: message };
  }
}

/** Fire-and-forget CRM sync after order creation (does not block response). */
export function scheduleOrderCrmSync(orderId: string, source?: string): void {
  void syncOrderToCrm(orderId, { source }).catch((err) => {
    console.error("Unhandled CRM sync error", orderId, err);
  });
}

/** Notify CRM when admin changes order status (best-effort). */
export function scheduleCrmStatusNote(order: Order): void {
  const config = getCrmConfig();
  if (!config || !order.crmLeadId) return;
  void updateKommoLeadStatusNote(config, order.crmLeadId, order).catch((err) => {
    console.error("CRM status note error", order.id, err);
  });
}
