import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, CheckCircle2, Upload, BadgeCheck, Building2, Plus, Star,
  Fingerprint, Smartphone, Trash2, Eye, EyeOff, Bell, Gift, Tag, Clock, Palette,
  Sun, Moon, MonitorSmartphone, Languages, Headphones, MessageCircle, Phone, Mail,
  Share2, Copy, AlertTriangle, Activity as ActivityIcon, Lock, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { securityActions, useSecurity } from "@/lib/security-store";
import type { MoreOptionId } from "./MoreOptionsSheet";

type Props = { id: MoreOptionId; onBack: () => void };

const HEADER_GRADIENTS: Partial<Record<MoreOptionId, string>> = {
  verify: "from-emerald-500 to-teal-600",
  "upi-id": "from-violet-500 to-purple-600",
  security: "from-blue-500 to-sky-600",
  "change-pin": "from-orange-500 to-amber-600",
  privacy: "from-cyan-500 to-teal-600",
  notifications: "from-amber-500 to-orange-500",
  theme: "from-pink-500 to-rose-600",
  language: "from-blue-500 to-indigo-600",
  help: "from-amber-500 to-yellow-500",
  refer: "from-emerald-500 to-teal-600",
  activity: "from-rose-500 to-red-500",
  devices: "from-slate-500 to-slate-700",
  "delete-account": "from-red-500 to-rose-700",
};

const TITLES: Partial<Record<MoreOptionId, string>> = {
  verify: "Profile Verification",
  "upi-id": "UPI & Payment Settings",
  security: "Security Center",
  "change-pin": "Change PIN",
  privacy: "Privacy Controls",
  notifications: "Notification Settings",
  theme: "Theme & Appearance",
  language: "Language",
  help: "Help & Support",
  refer: "Refer & Earn",
  activity: "Account Activity",
  devices: "Manage Devices",
  "delete-account": "Delete Account",
};

export function SettingsDetailScreen({ id, onBack }: Props) {
  const gradient = HEADER_GRADIENTS[id] ?? "from-slate-700 to-slate-900";
  const title = TITLES[id] ?? "Settings";

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col">
      <div className={`bg-gradient-to-br ${gradient} px-5 pt-12 pb-6 rounded-b-3xl shadow-lg`}>
        <button
          onClick={() => { playClick(); vibrate(15); onBack(); }}
          className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3 active:scale-90 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-xs text-white/80 mt-1">Secure · Encrypted · Real-time</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {id === "verify" && <VerifyBody />}
        {id === "upi-id" && <UpiBody />}
        {id === "security" && <SecurityBody />}
        {id === "change-pin" && <ChangePinBody />}
        {id === "privacy" && <PrivacyBody />}
        {id === "notifications" && <NotificationsBody />}
        {id === "theme" && <ThemeBody />}
        {id === "language" && <LanguageBody />}
        {id === "help" && <HelpBody />}
        {id === "refer" && <ReferBody />}
        {id === "activity" && <ActivityBody />}
        {id === "devices" && <DevicesBody />}
        {id === "delete-account" && <DeleteAccountBody onBack={onBack} />}
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl ${className}`}>{children}</div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => { playClick(); vibrate(15); onChange(!checked); }}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-700"}`}
      aria-pressed={checked}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${checked ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}

function Row({
  icon: Icon, label, sub, right, onClick, danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick ? () => { playClick(); vibrate(10); onClick(); } : undefined}
      className={`w-full flex items-center gap-3 p-3.5 text-left ${onClick ? "active:bg-slate-800/60" : ""} transition-colors`}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/15 text-red-400" : "bg-slate-800 text-slate-200"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold ${danger ? "text-red-400" : "text-slate-100"}`}>{label}</p>
        {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
      </div>
      {right}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-bold tracking-[0.12em] text-slate-400 mt-5 mb-2 px-1">{children}</h2>;
}

function ApplyingToast({ msg = "Updating settings…" }: { msg?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 justify-center">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> {msg}
    </div>
  );
}

function useProfile() {
  const [name, setName] = useState("User Name");
  const [phone, setPhone] = useState("+91 98765 43210");
  useEffect(() => {
    const n = localStorage.getItem("gpay-user-name");
    const p = localStorage.getItem("gpay-user-phone");
    if (n) setName(n);
    if (p) setPhone(p);
  }, []);
  return { name, phone };
}

/* ---------- 1. Verification ---------- */

function VerifyBody() {
  const { name, phone } = useProfile();
  const [status, setStatus] = useState<"pending" | "verifying" | "verified">(
    () => (localStorage.getItem("gpay-verified") === "1" ? "verified" : "pending"),
  );
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFile(url);
    playClick(); vibrate(15);
  };

  const verify = () => {
    if (!file) { toast.error("Upload an ID first"); return; }
    setStatus("verifying");
    setTimeout(() => {
      setStatus("verified");
      localStorage.setItem("gpay-verified", "1");
      playSuccess(); vibrate([40, 30, 80]);
      toast.success("Profile verified ✔");
    }, 1800);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold">
            {name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{name}</p>
            <p className="text-xs text-slate-400">{phone}</p>
          </div>
          {status === "verified" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">Pending</span>
          )}
        </div>
      </Card>

      <SectionTitle>UPLOAD GOVERNMENT ID</SectionTitle>
      <Card className="p-4">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
        {file ? (
          <div className="space-y-2">
            <img src={file} alt="ID preview" className="w-full max-h-48 object-cover rounded-xl border border-slate-800" />
            <button onClick={() => fileRef.current?.click()} className="text-xs text-emerald-400">Replace file</button>
          </div>
        ) : (
          <button
            onClick={() => { playClick(); fileRef.current?.click(); }}
            className="w-full border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Upload className="h-6 w-6 text-slate-400" />
            <p className="text-sm font-semibold">Upload Aadhaar / PAN / DL</p>
            <p className="text-[11px] text-slate-500">JPG, PNG · max 5MB</p>
          </button>
        )}
      </Card>

      <button
        disabled={status === "verifying" || status === "verified"}
        onClick={verify}
        className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-60 active:scale-[0.99]"
      >
        {status === "verifying" ? (
          <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</span>
        ) : status === "verified" ? "Verified ✔" : "Verify Now"}
      </button>
    </>
  );
}

/* ---------- 2. UPI & Payment Settings ---------- */

function UpiBody() {
  const { name } = useProfile();
  const handle = name.toLowerCase().split(" ")[0] || "user";
  const [banks, setBanks] = useState([
    { id: "1", name: "HDFC Bank", masked: "XXXX 1234", primary: true },
    { id: "2", name: "SBI", masked: "XXXX 5678", primary: false },
  ]);
  const [limit, setLimit] = useState(100000);

  const setPrimary = (id: string) => {
    setBanks((b) => b.map((x) => ({ ...x, primary: x.id === id })));
    toast.success("Default account updated");
  };
  const addBank = () => {
    const next = { id: String(Date.now()), name: "Axis Bank", masked: "XXXX " + (1000 + Math.floor(Math.random() * 9000)), primary: false };
    setBanks((b) => [...b, next]);
    toast.success("Bank account added");
  };

  return (
    <>
      <Card className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-slate-400">Your UPI ID</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-lg font-bold">{handle}@okbank</p>
          <button
            onClick={() => { navigator.clipboard?.writeText(`${handle}@okbank`); toast.success("UPI ID copied"); playClick(); vibrate(15); }}
            className="text-xs text-emerald-400 inline-flex items-center gap-1"
          ><Copy className="h-3.5 w-3.5" /> Copy</button>
        </div>
      </Card>

      <SectionTitle>LINKED BANK ACCOUNTS</SectionTitle>
      <Card className="divide-y divide-slate-800/80 overflow-hidden">
        {banks.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3.5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{b.name}</p>
              <p className="text-[11px] text-slate-400">A/c {b.masked}</p>
            </div>
            {b.primary ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <Star className="h-3 w-3" /> Default
              </span>
            ) : (
              <button onClick={() => setPrimary(b.id)} className="text-[11px] text-emerald-400 font-semibold">Set default</button>
            )}
          </div>
        ))}
        <button onClick={addBank} className="w-full p-3.5 flex items-center gap-2 text-emerald-400 text-sm font-semibold active:bg-slate-800/60">
          <Plus className="h-4 w-4" /> Add bank account
        </button>
      </Card>

      <SectionTitle>PAYMENT LIMITS</SectionTitle>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm">Daily UPI limit</p>
          <p className="text-sm font-bold">₹{limit.toLocaleString("en-IN")}</p>
        </div>
        <input
          type="range" min={1000} max={100000} step={1000} value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <p className="text-[11px] text-slate-500 mt-1">Max ₹1,00,000 / day per RBI rules.</p>
      </Card>
    </>
  );
}

/* ---------- 3. Security Center ---------- */

function SecurityBody() {
  const [appLock, setAppLock] = useState(true);
  const [bio, setBio] = useState(true);
  const autoLockMs = useSecurity((s) => s.autoLockMs);
  const AUTO_OPTS: { label: string; ms: number }[] = [
    { label: "Immediate", ms: 0 },
    { label: "30 sec", ms: 30_000 },
    { label: "1 min", ms: 60_000 },
    { label: "5 min", ms: 300_000 },
    { label: "10 min", ms: 600_000 },
    { label: "Never", ms: -1 },
  ];
  const devices = [
    { id: "1", name: "iPhone 17 Pro", loc: "Kochi, IN", current: true },
    { id: "2", name: "iPad Air", loc: "Kochi, IN", current: false },
  ];
  const logins = [
    { ts: "Today, 9:42 AM", device: "iPhone 17 Pro", ok: true },
    { ts: "Yesterday, 8:10 PM", device: "iPad Air", ok: true },
    { ts: "2 days ago", device: "Unknown Web", ok: false },
  ];

  return (
    <>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        <Row icon={Lock} label="App Lock" sub="Require unlock to open the app" right={<Toggle checked={appLock} onChange={setAppLock} />} />
        <Row icon={Fingerprint} label="Fingerprint / Face Unlock" sub="Use biometrics for payments" right={<Toggle checked={bio} onChange={setBio} />} />
      </Card>

      <SectionTitle>AUTO-LOCK TIMER</SectionTitle>
      <Card className="p-3">
        <p className="text-xs text-slate-400 mb-3 px-1">Lock the app after a period of inactivity</p>
        <div className="grid grid-cols-3 gap-2">
          {AUTO_OPTS.map((o) => {
            const active = autoLockMs === o.ms;
            return (
              <button
                key={o.ms}
                onClick={() => { playClick(); vibrate(8); securityActions.setAutoLock(o.ms); toast.success(`Auto-lock: ${o.label}`); }}
                className={`h-10 rounded-xl text-xs font-semibold transition active:scale-95 ${
                  active ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-slate-800/80 text-slate-300"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionTitle>LOGGED-IN DEVICES</SectionTitle>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        {devices.map((d) => (
          <Row key={d.id} icon={Smartphone} label={d.name} sub={`${d.loc}${d.current ? " · This device" : ""}`}
            right={d.current ? <span className="text-[10px] font-bold text-emerald-400">Active</span> : null} />
        ))}
      </Card>

      <SectionTitle>LOGIN ACTIVITY</SectionTitle>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        {logins.map((l, i) => (
          <Row key={i} icon={l.ok ? CheckCircle2 : AlertTriangle} label={l.device} sub={l.ts}
            danger={!l.ok}
            right={<span className={`text-[10px] font-bold ${l.ok ? "text-emerald-400" : "text-red-400"}`}>{l.ok ? "OK" : "Suspicious"}</span>} />
        ))}
      </Card>
    </>
  );
}

/* ---------- 4. Change PIN ---------- */

function ChangePinBody() {
  const [step, setStep] = useState<"old" | "new" | "confirm" | "done">("old");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setPin(""); setError(null); };

  const submitDigit = (d: string) => {
    if (pin.length >= 4 || busy) return;
    playClick(); vibrate(8);
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (step === "old") {
          if (next === "1234") { setStep("new"); reset(); }
          else { setError("Incorrect PIN"); vibrate([60, 40, 60]); setTimeout(reset, 600); }
        } else if (step === "new") {
          setNewPin(next); setStep("confirm"); reset();
        } else if (step === "confirm") {
          if (next === newPin) {
            setBusy(true);
            setTimeout(() => { setStep("done"); playSuccess(); vibrate([40, 30, 80]); }, 1200);
          } else {
            setError("PINs don't match"); vibrate([60, 40, 60]); setTimeout(reset, 600);
          }
        }
      }, 150);
    }
  };

  if (step === "done") {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mt-12">
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="font-bold text-xl mt-4">PIN Changed</h2>
        <p className="text-sm text-slate-400 mt-1">Use your new PIN for future payments.</p>
      </motion.div>
    );
  }

  const labels = { old: "Enter current PIN", new: "Set new 4-digit PIN", confirm: "Confirm new PIN" } as const;

  return (
    <>
      <p className="text-center font-semibold mt-2">{labels[step]}</p>
      {step === "old" && <p className="text-center text-[11px] text-slate-500 mt-1">Demo PIN: 1234</p>}
      <div className="flex justify-center gap-3 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-4 w-4 rounded-full border-2 ${pin.length > i ? (error ? "bg-red-500 border-red-500" : "bg-emerald-500 border-emerald-500") : "border-slate-600"}`} />
        ))}
      </div>
      {error && <p className="text-center text-xs text-red-400 mt-2">{error}</p>}
      {busy && <ApplyingToast msg="Updating PIN…" />}

      <div className="grid grid-cols-3 gap-2 mt-8 max-w-xs mx-auto">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button key={d} onClick={() => submitDigit(d)} className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-semibold active:scale-95 transition-transform">{d}</button>
        ))}
        <div />
        <button onClick={() => submitDigit("0")} className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-semibold active:scale-95 transition-transform">0</button>
        <button onClick={() => { playClick(); setPin((p) => p.slice(0, -1)); }} className="h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>
    </>
  );
}

/* ---------- 5. Privacy ---------- */

function PrivacyBody() {
  const [profileVis, setProfileVis] = useState(true);
  const [txnVis, setTxnVis] = useState(false);
  const [dataShare, setDataShare] = useState(false);
  const [hideBal, setHideBal] = useState(false);

  return (
    <Card className="overflow-hidden divide-y divide-slate-800/80">
      <Row icon={Eye} label="Profile visibility" sub="Allow others to find you by phone" right={<Toggle checked={profileVis} onChange={setProfileVis} />} />
      <Row icon={EyeOff} label="Transaction visibility" sub="Show transactions in shared feeds" right={<Toggle checked={txnVis} onChange={setTxnVis} />} />
      <Row icon={ActivityIcon} label="Data sharing" sub="Help improve the app with anonymous usage" right={<Toggle checked={dataShare} onChange={setDataShare} />} />
      <Row icon={Lock} label="Hide balance on home" sub="Mask amount until you tap" right={<Toggle checked={hideBal} onChange={setHideBal} />} />
    </Card>
  );
}

/* ---------- 6. Notifications ---------- */

function NotificationsBody() {
  const [s, setS] = useState({ payments: true, rewards: true, offers: false, reminders: true, sms: true });
  const set = (k: keyof typeof s) => (v: boolean) => setS((p) => ({ ...p, [k]: v }));
  return (
    <Card className="overflow-hidden divide-y divide-slate-800/80">
      <Row icon={Bell} label="Payments" sub="Sent & received notifications" right={<Toggle checked={s.payments} onChange={set("payments")} />} />
      <Row icon={Gift} label="Rewards" sub="Scratch cards & spin wins" right={<Toggle checked={s.rewards} onChange={set("rewards")} />} />
      <Row icon={Tag} label="Offers" sub="Cashback & promotions" right={<Toggle checked={s.offers} onChange={set("offers")} />} />
      <Row icon={Clock} label="Reminders" sub="Pending bills & recharge" right={<Toggle checked={s.reminders} onChange={set("reminders")} />} />
      <Row icon={MessageCircle} label="SMS alerts" sub="Get bank-style SMS" right={<Toggle checked={s.sms} onChange={set("sms")} />} />
    </Card>
  );
}

/* ---------- 7. Theme ---------- */

function ThemeBody() {
  type Mode = "dark" | "light" | "system";
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("theme-mode") as Mode) || "dark");
  const [busy, setBusy] = useState(false);

  const apply = (m: Mode) => {
    setMode(m);
    setBusy(true);
    playClick(); vibrate(15);
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = m === "dark" || (m === "system" && sysDark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme-mode", m);
    localStorage.setItem("theme", dark ? "dark" : "light");
    setTimeout(() => { setBusy(false); toast.success(`Theme: ${m}`); }, 500);
  };

  const opt = (m: Mode, label: string, sub: string, Icon: React.ComponentType<{ className?: string }>) => (
    <button
      key={m}
      onClick={() => apply(m)}
      className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors ${mode === m ? "bg-emerald-500/10" : "active:bg-slate-800/60"}`}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${mode === m ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-200"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold">{label}</p>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
      {mode === m && <Check className="h-4 w-4 text-emerald-400" />}
    </button>
  );

  return (
    <>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        {opt("dark", "Dark Mode", "Easier on the eyes", Moon)}
        {opt("light", "Light Mode", "Bright & crisp", Sun)}
        {opt("system", "System Default", "Match device setting", MonitorSmartphone)}
      </Card>
      {busy && <ApplyingToast msg="Applying theme…" />}
    </>
  );
}

/* ---------- 8. Language ---------- */

function LanguageBody() {
  const langs = useMemo(() => [
    { code: "en", name: "English", native: "English" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
  ], []);
  const [sel, setSel] = useState(() => localStorage.getItem("gpay-lang") || "en");
  const [busy, setBusy] = useState(false);

  const apply = () => {
    setBusy(true); playClick(); vibrate(15);
    setTimeout(() => {
      localStorage.setItem("gpay-lang", sel);
      setBusy(false);
      toast.success("Language updated");
    }, 800);
  };

  return (
    <>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => { setSel(l.code); playClick(); vibrate(10); }}
            className={`w-full flex items-center gap-3 p-3.5 text-left ${sel === l.code ? "bg-emerald-500/10" : "active:bg-slate-800/60"}`}
          >
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${sel === l.code ? "border-emerald-500" : "border-slate-600"}`}>
              {sel === l.code && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">{l.name}</p>
              <p className="text-[11px] text-slate-400">{l.native}</p>
            </div>
          </button>
        ))}
      </Card>
      <button
        onClick={apply}
        disabled={busy}
        className="mt-5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Applying…</span> : "Apply"}
      </button>
    </>
  );
}

/* ---------- 9. Help & Support ---------- */

function HelpBody() {
  const faqs = [
    { q: "How do I send money?", a: "Tap Pay → choose contact or UPI ID → enter amount → confirm with PIN." },
    { q: "How are rewards earned?", a: "You get scratch cards on payments above ₹100 and a daily spin." },
    { q: "Is my PIN secure?", a: "Your PIN is stored locally and never transmitted." },
    { q: "How do I change my bank?", a: "Go to UPI & Payment Settings → Set default account." },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        <Row icon={MessageCircle} label="Chat with us" sub="Avg reply 2 min" onClick={() => toast("Chat opened — agent joining…")} />
        <Row icon={Phone} label="Call support" sub="1800-123-4567" onClick={() => toast.success("Calling support…")} />
        <Row icon={Mail} label="Email" sub="help@gpay.demo" onClick={() => toast("Drafting email…")} />
      </Card>
      <SectionTitle>FREQUENTLY ASKED</SectionTitle>
      <Card className="overflow-hidden divide-y divide-slate-800/80">
        {faqs.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => { playClick(); vibrate(10); setOpen(open === i ? null : i); }}
              className="w-full flex items-center justify-between p-3.5 text-left active:bg-slate-800/60"
            >
              <span className="text-sm font-semibold pr-3">{f.q}</span>
              <span className="text-slate-500 text-lg">{open === i ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-3.5 pb-3 text-[12px] text-slate-400">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </Card>
    </>
  );
}

/* ---------- 10. Refer & Earn ---------- */

function ReferBody() {
  const code = "GPAY-USER-2024";
  const [earned, setEarned] = useState(450);
  const share = async () => {
    playClick(); vibrate(15);
    const text = `Join me on GPay Clone, use code ${code} and we both earn ₹50!`;
    if (navigator.share) {
      try { await navigator.share({ title: "Refer & Earn", text }); setEarned((e) => e + 50); toast.success("Shared!"); }
      catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(text); toast.success("Invite copied");
    }
  };
  return (
    <>
      <Card className="p-5 text-center bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30">
        <Gift className="h-10 w-10 text-emerald-400 mx-auto" />
        <h2 className="font-bold text-xl mt-2">Refer friends, earn ₹50 each</h2>
        <p className="text-xs text-slate-400 mt-1">No limits. Get paid when they make their first payment.</p>
        <div className="mt-4 flex items-center gap-2 justify-center">
          <span className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm tracking-wider">{code}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(code); toast.success("Code copied"); playClick(); }}
            className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center"
          ><Copy className="h-4 w-4" /></button>
        </div>
      </Card>
      <button
        onClick={share}
        className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <Share2 className="h-4 w-4" /> Invite friends
      </button>
      <Card className="mt-5 p-4">
        <p className="text-xs text-slate-400">Total earned</p>
        <p className="text-2xl font-bold mt-1">₹{earned.toLocaleString("en-IN")}</p>
        <p className="text-[11px] text-emerald-400 mt-1">+₹50 per successful invite</p>
      </Card>
    </>
  );
}

/* ---------- 11. Activity ---------- */

function ActivityBody() {
  const items = [
    { ts: "Today, 09:42", device: "iPhone 17 Pro", loc: "Kochi, IN", ok: true },
    { ts: "Yesterday, 20:10", device: "iPad Air", loc: "Kochi, IN", ok: true },
    { ts: "Mon, 14:05", device: "Web (Chrome)", loc: "Bengaluru, IN", ok: true },
    { ts: "Sun, 02:33", device: "Unknown Android", loc: "Lagos, NG", ok: false },
  ];
  return (
    <Card className="overflow-hidden divide-y divide-slate-800/80">
      {items.map((i, idx) => (
        <Row key={idx}
          icon={i.ok ? CheckCircle2 : AlertTriangle}
          label={i.device}
          sub={`${i.loc} · ${i.ts}`}
          danger={!i.ok}
          right={<span className={`text-[10px] font-bold ${i.ok ? "text-emerald-400" : "text-red-400"}`}>{i.ok ? "OK" : "Review"}</span>}
        />
      ))}
    </Card>
  );
}

/* ---------- 12. Devices ---------- */

function DevicesBody() {
  const [items, setItems] = useState([
    { id: "1", name: "iPhone 17 Pro", loc: "Kochi · This device", current: true },
    { id: "2", name: "iPad Air", loc: "Kochi · 2 hours ago", current: false },
    { id: "3", name: "MacBook Pro", loc: "Kochi · 1 day ago", current: false },
  ]);
  const remove = (id: string) => {
    playClick(); vibrate(20);
    setItems((it) => it.filter((x) => x.id !== id));
    toast.success("Device removed");
  };
  return (
    <Card className="overflow-hidden divide-y divide-slate-800/80">
      {items.map((d) => (
        <Row
          key={d.id}
          icon={Smartphone}
          label={d.name}
          sub={d.loc}
          right={d.current ? (
            <span className="text-[10px] font-bold text-emerald-400">Active</span>
          ) : (
            <button onClick={() => remove(d.id)} className="h-8 w-8 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center active:scale-90">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        />
      ))}
    </Card>
  );
}

/* ---------- 13. Delete account ---------- */

function DeleteAccountBody({ onBack }: { onBack: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const remove = () => {
    if (confirm !== "DELETE") { toast.error('Type "DELETE" to confirm'); return; }
    setBusy(true);
    setTimeout(() => {
      localStorage.removeItem("gpay-clone-v1");
      toast.success("Account deleted (demo)");
      onBack();
    }, 1400);
  };
  return (
    <>
      <Card className="p-4 border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-2 text-red-400 font-semibold">
          <AlertTriangle className="h-5 w-5" /> This action is permanent
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Deleting your account will erase all transactions, rewards and balance.
          You will be signed out from all devices.
        </p>
      </Card>
      <SectionTitle>TYPE "DELETE" TO CONFIRM</SectionTitle>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value.toUpperCase())}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
        placeholder="DELETE"
      />
      <button
        onClick={remove}
        disabled={busy}
        className="mt-5 w-full bg-gradient-to-r from-red-500 to-rose-700 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</span> : "Delete my account"}
      </button>
    </>
  );
}

/* unused import guards */
void Languages; void Headphones; void Palette;