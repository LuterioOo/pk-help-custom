export const TRADE_IN_COUPON_STORAGE_KEY = "pkhelp-trade-in-coupon";
export const CONTACTS_STORAGE_KEY = "pkhelp-contacts";

export type TradeInCouponState = {
  amount: number;
  phone: string;
  name?: string;
  appliedAt: string;
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
      messenger: parsed.messenger ? String(parsed.messenger) : undefined,
      name: parsed.name ? String(parsed.name) : undefined,
    };
  } catch {
    return null;
  }
}

export function saveStoredContacts(contacts: StoredContacts) {
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
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

export function isTradeInBuildUnlocked(): boolean {
  const coupon = loadTradeInCoupon();
  const contacts = loadStoredContacts();
  return Boolean(coupon && coupon.amount > 0 && contacts?.phone);
}
