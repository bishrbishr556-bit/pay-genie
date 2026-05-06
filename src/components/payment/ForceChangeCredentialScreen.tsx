import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Check } from "lucide-react";
import { securityActions, type LockMethod } from "@/lib/security-store";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { PinPad } from "./security/PinPad";
import { PatternPad } from "./security/PatternPad";
import { toast } from "sonner";

type Kind = LockMethod | "admin";

export function ForceChangeCredentialScreen({
  kind,
  onDone,
}: {
  kind: Kind;
  onDone: () => void;
}) {
  const [first, setFirst] = useState<string>("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const labels: Record<Kind, { title: string; sub: string }> = {
    pin: { title: "Set a new PIN", sub: "Default PIN is no longer secure. Choose a new 4-digit PIN." },
    pattern: { title: "Set a new pattern", sub: "Default pattern is no longer secure. Draw a new pattern (4+ dots)." },
    password: { title: "Set a new password", sub: "Default password is no longer secure. Choose a new password (6+ chars)." },
    admin: { title: "Change admin password", sub: "Default admin password must be changed before continuing." },
  };

  const handleFirst = (val: string) => {
    if (kind === "pin" && val === "1234") { setError("Cannot reuse default PIN"); vibrate([30, 40, 30]); return; }
    if (kind === "pattern" && val === "0-3-6-7-8") { setError("Cannot reuse default pattern"); vibrate([30, 40, 30]); return; }
    if (kind === "password" && val === "demo1234") { setError("Cannot reuse default password"); vibrate([30, 40, 30]); return; }
    if (kind === "admin" && val === "Admin123") { setError("Cannot reuse default password"); vibrate([30, 40, 30]); return; }
    setError(""); setFirst(val);
  };

  const handleConfirm = (val: string) => {
    if (val !== first) {
      setError("Doesn't match — try again"); vibrate([30, 40, 30]); setFirst("");
      return;
    }
    if (kind === "admin") securityActions.changeAdminPassword(val);
    else securityActions.changeSecret(kind, val);
    setDone(true); playSuccess(); vibrate([20, 30, 20]);
    toast.success("Updated successfully");
    setTimeout(onDone, 1100);
  };

  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
          <Check className="h-12 w-12" strokeWidth={3} />
        </motion.div>
        <p className="mt-5 font-bold text-lg">Saved</p>
      </div>
    );
  }

  const cur = labels[kind];
  const stage = first ? "confirm" : "set";

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950 text-white px-6">
      <div className="pt-12 pb-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <ShieldAlert className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-4 text-xl font-bold">{stage === "set" ? cur.title : "Confirm"}</h1>
        <p className="text-xs text-slate-300 mt-1 px-4">{stage === "set" ? cur.sub : "Re-enter to confirm"}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {kind === "pin" && (
          <PinPad key={stage} length={4} onComplete={stage === "set" ? handleFirst : handleConfirm} />
        )}
        {kind === "pattern" && (
          <PatternPad key={stage} onComplete={stage === "set" ? handleFirst : handleConfirm} />
        )}
        {(kind === "password" || kind === "admin") && (
          <PasswordEntry key={stage} min={6} onSubmit={stage === "set" ? handleFirst : handleConfirm} />
        )}
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      </div>
    </div>
  );
}

function PasswordEntry({ onSubmit, min }: { onSubmit: (v: string) => void; min: number }) {
  const [val, setVal] = useState("");
  return (
    <div className="w-full space-y-3 px-2">
      <input
        type="password"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={`At least ${min} characters`}
        className="w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 outline-none focus:border-amber-400 text-white placeholder:text-slate-500"
        autoFocus
      />
      <button
        onClick={() => { playClick(); if (val.length >= min) { onSubmit(val); setVal(""); } }}
        disabled={val.length < min}
        className="w-full h-12 rounded-2xl bg-amber-500 font-bold active:scale-[0.98] disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}