import { useEffect, useState } from "react";

export type OfflineProfile = { name: string; phone: string; pinHash: string; createdAt: number };
export type OfflineTxn = {
  id: string;
  to: string;
  upi: string;
  amount: number;
  note?: string;
  ts: number;
  status: "pending" | "synced";
  syncedAt?: number;
};

type State = {
  enabled: boolean;
  profile: OfflineProfile | null;
  txns: OfflineTxn[];
  syncing: boolean;
};

const KEY = "gpay-offline-v1";

const initial: State = { enabled: false, profile: null, txns: [], syncing: false };

let state: State = initial;
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw), syncing: false };
  } catch {
    return initial;
  }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

let inited = false;
export function initOffline() {
  if (inited) return;
  inited = true;
  state = load();
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => { void offlineActions.syncPending(); });
  }
}

// simple hash (not cryptographic — demo only)
function hashPin(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) h = (h * 31 + pin.charCodeAt(i)) | 0;
  return `h_${h}_${pin.length}`;
}

export function useOffline<T>(selector: (s: State) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return selector(state);
}

export function getOfflineState() { return state; }

export const offlineActions = {
  enable(profile: { name: string; phone: string; pin: string }) {
    state = {
      ...state,
      enabled: true,
      profile: {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        pinHash: hashPin(profile.pin),
        createdAt: Date.now(),
      },
    };
    persist();
  },
  disable() {
    state = { ...state, enabled: false };
    persist();
  },
  verifyPin(pin: string): boolean {
    if (!state.profile) return false;
    return hashPin(pin) === state.profile.pinHash;
  },
  addTxn(t: { to: string; upi: string; amount: number; note?: string }): OfflineTxn {
    const txn: OfflineTxn = {
      id: crypto.randomUUID(),
      to: t.to,
      upi: t.upi,
      amount: t.amount,
      note: t.note,
      ts: Date.now(),
      status: "pending",
    };
    state = { ...state, txns: [txn, ...state.txns] };
    persist();
    return txn;
  },
  async syncPending(): Promise<number> {
    if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
    const pending = state.txns.filter((t) => t.status === "pending");
    if (pending.length === 0) return 0;
    state = { ...state, syncing: true };
    persist();
    // Simulate network roundtrip
    await new Promise((r) => setTimeout(r, 1200));
    const now = Date.now();
    state = {
      ...state,
      syncing: false,
      txns: state.txns.map((t) =>
        t.status === "pending" ? { ...t, status: "synced" as const, syncedAt: now } : t
      ),
    };
    persist();
    return pending.length;
  },
  clear() {
    state = initial;
    persist();
  },
};
