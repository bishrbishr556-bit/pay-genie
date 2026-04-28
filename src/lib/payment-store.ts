import { useEffect, useState } from "react";

export type Txn = {
  id: string;
  type: "sent" | "received";
  amount: number;
  name: string;
  upi: string;
  note?: string;
  ts: number;
};

export type Reward = {
  id: string;
  amount: number;
  scratched: boolean;
  ts: number;
};

export type SmsMsg = {
  id: string;
  text: string;
  ts: number;
  type: "sent" | "received";
};

export type AppState = {
  balance: number;
  txns: Txn[];
  rewards: Reward[];
  sms: SmsMsg[];
  cashback: number;
  lastSpinDate: string | null;
  pinSet: boolean;
  unlocked: boolean;
};

const KEY = "gpay-clone-v1";

const initial: AppState = {
  balance: 25840,
  txns: [],
  rewards: [],
  sms: [],
  cashback: 0,
  lastSpinDate: null,
  pinSet: false,
  unlocked: false,
};

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw), unlocked: false };
  } catch {
    return initial;
  }
}

let state: AppState = initial;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

export function initStore() {
  state = load();
  listeners.forEach((l) => l());
}

export function useStore<T>(selector: (s: AppState) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return selector(state);
}

export function getState() {
  return state;
}

export const actions = {
  unlock() {
    state = { ...state, unlocked: true };
    persist();
  },
  lock() {
    state = { ...state, unlocked: false };
    persist();
  },
  setPin() {
    state = { ...state, pinSet: true };
    persist();
  },
  sendMoney(name: string, upi: string, amount: number, note?: string) {
    const txn: Txn = {
      id: crypto.randomUUID(),
      type: "sent",
      amount,
      name,
      upi,
      note,
      ts: Date.now(),
    };
    const sms: SmsMsg = {
      id: crypto.randomUUID(),
      text: `₹${amount} debited from A/c XX1234. Sent to ${name} (${upi}). Avl bal: ₹${(state.balance - amount).toFixed(2)}`,
      ts: Date.now(),
      type: "sent",
    };
    const reward: Reward = {
      id: crypto.randomUUID(),
      amount: pickReward(amount),
      scratched: false,
      ts: Date.now(),
    };
    state = {
      ...state,
      balance: state.balance - amount,
      txns: [txn, ...state.txns],
      sms: [sms, ...state.sms],
      rewards: [reward, ...state.rewards],
    };
    persist();
    // broadcast for soundbox? sent doesn't trigger
    return { txn, reward };
  },
  receiveMoney(name: string, amount: number) {
    const txn: Txn = {
      id: crypto.randomUUID(),
      type: "received",
      amount,
      name,
      upi: `${name.toLowerCase()}@upi`,
      ts: Date.now(),
    };
    const sms: SmsMsg = {
      id: crypto.randomUUID(),
      text: `₹${amount} credited to your account from ${name}. Avl bal: ₹${(state.balance + amount).toFixed(2)}`,
      ts: Date.now(),
      type: "received",
    };
    state = {
      ...state,
      balance: state.balance + amount,
      txns: [txn, ...state.txns],
      sms: [sms, ...state.sms],
    };
    persist();
    try {
      const bc = new BroadcastChannel("gpay-soundbox");
      bc.postMessage({ type: "received", amount, name });
      bc.close();
    } catch {}
    return txn;
  },
  scratchReward(id: string) {
    const r = state.rewards.find((x) => x.id === id);
    if (!r || r.scratched) return;
    state = {
      ...state,
      cashback: state.cashback + r.amount,
      balance: state.balance + r.amount,
      rewards: state.rewards.map((x) => (x.id === id ? { ...x, scratched: true } : x)),
    };
    persist();
  },
  spinWheel(): { reward: number; canSpin: boolean } {
    const today = new Date().toDateString();
    if (state.lastSpinDate === today) return { reward: 0, canSpin: false };
    const reward = pickSpinReward();
    const r: Reward = { id: crypto.randomUUID(), amount: reward, scratched: false, ts: Date.now() };
    state = {
      ...state,
      lastSpinDate: today,
      rewards: [r, ...state.rewards],
    };
    persist();
    return { reward, canSpin: true };
  },
};

function pickReward(amount: number): number {
  const roll = Math.random();
  if (amount > 1000) {
    if (roll < 0.05) return 100;
    if (roll < 0.2) return 50;
    if (roll < 0.5) return 20;
    if (roll < 0.85) return 10;
    return 0;
  }
  if (roll < 0.02) return 100;
  if (roll < 0.1) return 50;
  if (roll < 0.3) return 20;
  if (roll < 0.7) return 10;
  return 0;
}

function pickSpinReward(): number {
  const roll = Math.random();
  if (roll < 0.02) return 100;
  if (roll < 0.1) return 50;
  if (roll < 0.3) return 20;
  if (roll < 0.6) return 10;
  if (roll < 0.85) return 5;
  return 0;
}

// UPI directory for name detection
export const upiDirectory: Record<string, string> = {
  "anas@okbank": "Anas P",
  "rahim@upi": "Rahim K",
  "nabeel@ybl": "Nabeel",
  "priya@okhdfc": "Priya Sharma",
  "ravi@paytm": "Ravi Kumar",
  "meera@oksbi": "Meera Nair",
};

// Sound helpers (Web Audio API — no asset deps)
let audioCtx: AudioContext | null = null;
function ctx() {
  if (!audioCtx && typeof window !== "undefined") {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}
export function playTone(freq: number, duration = 0.15, type: OscillatorType = "sine", gain = 0.15) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}
export function playSuccess() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 100);
  setTimeout(() => playTone(784, 0.2), 200);
}
export function playClick() {
  playTone(800, 0.04, "square", 0.05);
}
export function playReward() {
  playTone(880, 0.1);
  setTimeout(() => playTone(1175, 0.1), 80);
  setTimeout(() => playTone(1568, 0.25), 160);
}
export function playTick() {
  playTone(1200, 0.02, "square", 0.04);
}
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}
export function speakAmount(amount: number, lang: "en" | "ml" = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const text = lang === "ml" ? `${amount} രൂപ ലഭിച്ചു` : `${amount} rupees received`;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ml" ? "ml-IN" : "en-IN";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}