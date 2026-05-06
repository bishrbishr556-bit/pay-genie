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
  // Demo / force-change tracking
  defaultPinActive: boolean;
  defaultPatternActive: boolean;
  defaultPasswordActive: boolean;
  defaultAdminActive: boolean;
  mustChangePin: boolean;
  mustChangePattern: boolean;
  mustChangePassword: boolean;
  mustChangeAdmin: boolean;
  // Admin
  adminPasswordHash: string | null;
};

const KEY = "gpay-security-v1";

// non-cryptographic hash — DEMO ONLY
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h_${h}_${s.length}`;
}

// L-shape on a 3x3 grid (top-left → down → right)
export const DEFAULT_PIN = "1234";
export const DEFAULT_PATTERN = "0-3-6-7-8";
export const DEFAULT_PASSWORD = "demo1234";
export const DEFAULT_ADMIN = "Admin123";

const initial: SecurityState = {
  setupComplete: true,
  primary: "pin",
  pinHash: hash(DEFAULT_PIN),
  patternHash: hash(DEFAULT_PATTERN),
  passwordHash: hash(DEFAULT_PASSWORD),
  backupPasswordHash: hash(DEFAULT_PASSWORD),
  fingerprintEnabled: true,
  faceEnabled: false,
  decoyEnabled: false,
  decoyPinHash: null,
  decoyMode: false,
  failedAttempts: 0,
  lockedUntil: null,
  defaultPinActive: true,
  defaultPatternActive: true,
  defaultPasswordActive: true,
  defaultAdminActive: true,
  mustChangePin: false,
  mustChangePattern: false,
  mustChangePassword: false,
  mustChangeAdmin: false,
  adminPasswordHash: hash(DEFAULT_ADMIN),
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
      // detect default-credential use → force change after unlock
      const usedDefault =
        (m === "pin" && state.defaultPinActive && secret === DEFAULT_PIN) ||
        (m === "pattern" && state.defaultPatternActive && secret === DEFAULT_PATTERN) ||
        (m === "password" && state.defaultPasswordActive && secret === DEFAULT_PASSWORD);
      state = {
        ...state,
        failedAttempts: 0,
        lockedUntil: null,
        decoyMode: false,
        mustChangePin: usedDefault && m === "pin" ? true : state.mustChangePin,
        mustChangePattern: usedDefault && m === "pattern" ? true : state.mustChangePattern,
        mustChangePassword: usedDefault && m === "password" ? true : state.mustChangePassword,
      };
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
  changeSecret(method: LockMethod, newSecret: string) {
    const h = hash(newSecret);
    state = {
      ...state,
      pinHash: method === "pin" ? h : state.pinHash,
      patternHash: method === "pattern" ? h : state.patternHash,
      passwordHash: method === "password" ? h : state.passwordHash,
      defaultPinActive: method === "pin" ? false : state.defaultPinActive,
      defaultPatternActive: method === "pattern" ? false : state.defaultPatternActive,
      defaultPasswordActive: method === "password" ? false : state.defaultPasswordActive,
      mustChangePin: method === "pin" ? false : state.mustChangePin,
      mustChangePattern: method === "pattern" ? false : state.mustChangePattern,
      mustChangePassword: method === "password" ? false : state.mustChangePassword,
    };
    persist();
  },
  verifyAdmin(password: string): "ok" | "fail" {
    if (!state.adminPasswordHash) return "fail";
    if (hash(password) !== state.adminPasswordHash) return "fail";
    state = {
      ...state,
      mustChangeAdmin: state.defaultAdminActive && password === DEFAULT_ADMIN ? true : state.mustChangeAdmin,
    };
    persist();
    return "ok";
  },
  changeAdminPassword(newPassword: string) {
    state = {
      ...state,
      adminPasswordHash: hash(newPassword),
      defaultAdminActive: false,
      mustChangeAdmin: false,
    };
    persist();
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
      defaultPinActive: m === "pin" ? false : state.defaultPinActive,
      defaultPatternActive: m === "pattern" ? false : state.defaultPatternActive,
      defaultPasswordActive: m === "password" ? false : state.defaultPasswordActive,
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
