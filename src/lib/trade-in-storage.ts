export const TRADE_IN_COUPON_STORAGE_KEY = "pkhelp-trade-in-coupon";
export const CONTACTS_STORAGE_KEY = "pkhelp-contacts";
export const TRADE_IN_LEAD_STORAGE_KEY = "pkhelp-trade-in-lead";
export const TRADE_IN_FLOW_KEY = "pkhelp-trade-in-flow";

export type TradeInCouponState = {
  amount: number;
  phone: string;
  name?: string;
  appliedAt: string;
};

export type TradeInLeadState = {
  orderId: string;
  createdAt: string;
};

export type StoredContacts = {
  phone: string;
  messenger?: string;
  name?: string;
};

export function loadStoredContacts(): StoredContacts | null {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredContacts;
    if (!parsed.phone || String(parsed.phone).trim().length < 8) return null;
    return {
      phone: String(parsed.phone).trim(),
      messenger: parsed.messenger ? String(parsed.messenger).trim() : undefined,
      name: parsed.name ? String(parsed.name).trim() : undefined,
    };
  } catch {
    return null;
  }
}

export function saveStoredContacts(contacts: StoredContacts) {
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  window.dispatchEvent(new Event("pkhelp-trade-in-updated"));
}

export function loadTradeInCoupon(): TradeInCouponState | null {
  try {
    const raw = localStorage.getItem(TRADE_IN_COUPON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TradeInCouponState;
    if (!parsed.phone || typeof parsed.amount !== "number" || parsed.amount <= 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTradeInCoupon(state: TradeInCouponState) {
  localStorage.setItem(TRADE_IN_COUPON_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("pkhelp-trade-in-updated"));
}

export function saveTradeInLead(state: TradeInLeadState) {
  localStorage.setItem(TRADE_IN_LEAD_STORAGE_KEY, JSON.stringify(state));
}

export function loadTradeInLead(): TradeInLeadState | null {
  try {
    const raw = localStorage.getItem(TRADE_IN_LEAD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TradeInLeadState;
    if (!parsed.orderId || String(parsed.orderId).trim().length < 5) return null;
    return {
      orderId: String(parsed.orderId).trim(),
      createdAt: String(parsed.createdAt ?? ""),
    };
  } catch {
    return null;
  }
}

export function clearTradeInLead() {
  localStorage.removeItem(TRADE_IN_LEAD_STORAGE_KEY);
}

/** User opened Trade-In flow — builder CTA stays locked until coupon + contacts are complete. */
export function markTradeInFlowStarted() {
  try {
    localStorage.setItem(TRADE_IN_FLOW_KEY, "1");
    window.dispatchEvent(new Event("pkhelp-trade-in-updated"));
  } catch {
    /* ignore */
  }
}

export function isTradeInFlowActive(): boolean {
  try {
    return localStorage.getItem(TRADE_IN_FLOW_KEY) === "1";
  } catch {
    return false;
  }
}

export function hasTradeInContactsComplete(): boolean {
  const contacts = loadStoredContacts();
  if (!contacts) return false;
  const hasName = Boolean(contacts.name && contacts.name.length >= 2);
  const hasPhone = contacts.phone.length >= 8;
  const hasTelegram = Boolean(contacts.messenger && contacts.messenger.length >= 2);
  return hasName && hasPhone && hasTelegram;
}

export function isTradeInBuildUnlocked(): boolean {
  const coupon = loadTradeInCoupon();
  return Boolean(coupon && coupon.amount > 0 && hasTradeInContactsComplete());
}

/** Lock «Собрать ПК» only when user started Trade-In and has not finished the flow. */
export function shouldLockBuilderCta(): boolean {
  return isTradeInFlowActive() && !isTradeInBuildUnlocked();
}
