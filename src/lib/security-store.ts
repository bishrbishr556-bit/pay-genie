import { useEffect, useState } from "react";

export type LockMethod = "pin" | "pattern" | "password";
export type SecurityState = {
  setupComplete: boolean;
  primary: LockMethod | null;
  pinHash: string | null;        // 4 or 6 digit
  patternHash: string | null;    // sequence of dots e.g. "0-1-2-5-8"
  passwordHash: string | null;
  backupPasswordHash: string | null;
  fingerprintEnabled: boolean;
  faceEnabled: boolean;
  decoyEnabled: boolean;
  decoyPinHash: string | null;
  decoyMode: boolean;            // currently inside decoy environment
  failedAttempts: number;
  lockedUntil: number | null;    // ms timestamp
};

const KEY = "gpay-security-v1";

const initial: SecurityState = {
  setupComplete: false,
  primary: null,
  pinHash: null,
  patternHash: null,
  passwordHash: null,
  backupPasswordHash: null,
  fingerprintEnabled: false,
  faceEnabled: false,
  decoyEnabled: false,
  decoyPinHash: null,
  decoyMode: false,
  failedAttempts: 0,
  lockedUntil: null,
};

let state: SecurityState = initial;
const listeners = new Set<() => void>();

function load(): SecurityState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw), decoyMode: false };
  } catch {
    return initial;
  }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ ...state, decoyMode: false })); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

let inited = false;
export function initSecurity() {
  if (inited) return;
  inited = true;
  state = load();
  listeners.forEach((l) => l());
}

export function useSecurity<T>(selector: (s: SecurityState) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return selector(state);
}

export function getSecurity() { return state; }

// non-cryptographic hash — DEMO ONLY
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h_${h}_${s.length}`;
}

export const securityActions = {
  completeSetup(opts: {
    primary: LockMethod;
    secret: string;
    backupPassword?: string;
    fingerprint?: boolean;
    face?: boolean;
  }) {
    const h = hash(opts.secret);
    state = {
      ...state,
      setupComplete: true,
      primary: opts.primary,
      pinHash: opts.primary === "pin" ? h : state.pinHash,
      patternHash: opts.primary === "pattern" ? h : state.patternHash,
      passwordHash: opts.primary === "password" ? h : state.passwordHash,
      backupPasswordHash: opts.backupPassword ? hash(opts.backupPassword) : state.backupPasswordHash,
      fingerprintEnabled: !!opts.fingerprint,
      faceEnabled: !!opts.face,
      failedAttempts: 0,
      lockedUntil: null,
    };
    persist();
  },
  verify(secret: string, method?: LockMethod): "ok" | "decoy" | "fail" {
    const m = method ?? state.primary;
    if (!m) return "fail";
    const h = hash(secret);
    const target =
      m === "pin" ? state.pinHash :
      m === "pattern" ? state.patternHash :
      state.passwordHash;
    if (target && h === target) {
      state = { ...state, failedAttempts: 0, lockedUntil: null, decoyMode: false };
      persist();
      return "ok";
    }
    if (state.decoyEnabled && state.decoyPinHash && h === state.decoyPinHash) {
      state = { ...state, failedAttempts: 0, lockedUntil: null, decoyMode: true };
      persist();
      return "decoy";
    }
    const attempts = state.failedAttempts + 1;
    state = {
      ...state,
      failedAttempts: attempts,
      lockedUntil: attempts >= 5 ? Date.now() + 30_000 : state.lockedUntil,
    };
    persist();
    return "fail";
  },
  verifyBiometric(): boolean {
    state = { ...state, failedAttempts: 0, lockedUntil: null, decoyMode: false };
    persist();
    return true;
  },
  resetWithBackup(backup: string, newSecret: string): boolean {
    if (!state.backupPasswordHash) return false;
    if (hash(backup) !== state.backupPasswordHash) return false;
    const m = state.primary ?? "pin";
    const h = hash(newSecret);
    state = {
      ...state,
      pinHash: m === "pin" ? h : state.pinHash,
      patternHash: m === "pattern" ? h : state.patternHash,
      passwordHash: m === "password" ? h : state.passwordHash,
      failedAttempts: 0,
      lockedUntil: null,
    };
    persist();
    return true;
  },
  setDecoy(pin: string | null) {
    state = {
      ...state,
      decoyEnabled: !!pin,
      decoyPinHash: pin ? hash(pin) : null,
    };
    persist();
  },
  exitDecoy() {
    state = { ...state, decoyMode: false };
    persist();
  },
  resetAll() {
    state = initial;
    persist();
  },
};
