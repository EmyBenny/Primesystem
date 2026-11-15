import { Order, OrderStatus } from '../types';

const GUEST_ID_KEY = 'psg_guest_client_id_v1';
const GUEST_ORDERS_KEY = 'psg_guest_orders_v1';
const GUEST_PROFILE_KEY = 'psg_guest_billing_profile_v1';

export interface LocalBillingProfile {
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

export function getOrCreateGuestClientId(): string {
  try {
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing && /^guest_[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing;
    }
    const raw =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '')
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    const guestId = `guest_${raw.slice(0, 32)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
    return guestId;
  } catch {
    return `guest_${Date.now().toString(36)}fallback`;
  }
}

export function getLocalGuestOrders(): Order[] {
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalGuestOrder(order: Order): void {
  try {
    const current = getLocalGuestOrders();
    const filtered = current.filter((o) => o.id !== order.id);
    const updated = [order, ...filtered].slice(0, 40);
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function updateLocalGuestOrderStatus(orderId: string, status: OrderStatus): void {
  try {
    const current = getLocalGuestOrders();
    const updated = current.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function getLocalBillingProfile(): LocalBillingProfile | null {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalBillingProfile;
  } catch {
    return null;
  }
}

export function saveLocalBillingProfile(profile: LocalBillingProfile): void {
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}
