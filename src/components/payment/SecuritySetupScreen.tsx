import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Grid3x3, KeyRound, Fingerprint, ScanFace, Check, ChevronLeft } from "lucide-react";
import { securityActions, type LockMethod } from "@/lib/security-store";
import { actions, playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { PatternPad } from "./security/PatternPad";
import { PinPad } from "./security/PinPad";

type Step = "intro" | "choose" | "set" | "confirm" | "backup" | "biometrics" | "done";

export function SecuritySetupScreen() {
  const [step, setStep] = useState<Step>("intro");
  const [method, setMethod] = useState<LockMethod>("pin");
  const [secret, setSecret] = useState("");
  const [confirmVal, setConfirmVal] = useState("");
  const [backup, setBackup] = useState("");
  const [fingerprint, setFingerprint] = useState(true);
  const [face, setFace] = useState(false);
  const [error, setError] = useState("");

  const next = (s: Step) => { playClick(); vibrate(8); setError(""); setStep(s); };

  const handleSet = (val: string) => {
    setSecret(val);
    next("confirm");
  };

  const handleConfirm = (val: string) => {
    if (val !== secret) {
      setError("Doesn't match — try again");
      vibrate([30, 40, 30]);
      setConfirmVal("");
      return;
    }
    next("backup");
  };

  const finish = () => {
    securityActions.completeSetup({
      primary: method,
      secret,
      backupPassword: backup || undefined,
      fingerprint,
      face,
    });
    playSuccess();
    vibrate([20, 30, 20]);
    setStep("done");
    setTimeout(() => actions.unlock(), 1400);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center">
        {step !== "intro" && step !== "done" && (
          <button onClick={() => {
            playClick();
            const back: Record<Step, Step> = {
              intro: "intro", choose: "intro", set: "choose",
              confirm: "set", backup: "confirm", biometrics: "backup", done: "done",
            };
            setStep(back[step]); setError(""); setSecret(""); setConfirmVal("");
          }} className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6">
              <ShieldCheck className="h-12 w-12" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Secure Your App</h1>
            <p className="text-sm text-slate-300 mb-8">Set up a lock so only you can access your money.</p>
            <button onClick={() => next("choose")} className="w-full h-12 rounded-2xl bg-white text-slate-900 font-bold active:scale-[0.98] transition">
              Get Started
            </button>
          </motion.div>
        )}

        {step === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 px-6">
            <h2 className="text-xl font-bold mb-1">Choose lock method</h2>
            <p className="text-sm text-slate-400 mb-6">Pick your primary security</p>
            <div className="space-y-3">
              {[
                { id: "pin" as LockMethod, icon: Lock, title: "PIN", desc: "4-digit numeric code" },
                { id: "pattern" as LockMethod, icon: Grid3x3, title: "Pattern", desc: "Connect 4+ dots" },
                { id: "password" as LockMethod, icon: KeyRound, title: "Password", desc: "6+ characters" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setMethod(opt.id); next("set"); }}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 active:scale-[0.98] transition ${
                    method === opt.id ? "border-blue-400 bg-blue-500/15" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">{opt.title}</p>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "set" && (
          <motion.div key="set" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 px-6 flex flex-col">
            <h2 className="text-xl font-bold mb-1">Create your {method}</h2>
            <p className="text-sm text-slate-400 mb-6">Choose something memorable</p>
            <SecretInput method={method} onComplete={handleSet} />
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 px-6 flex flex-col">
            <h2 className="text-xl font-bold mb-1">Confirm your {method}</h2>
            <p className="text-sm text-slate-400 mb-6">Re-enter to confirm</p>
            <SecretInput key={confirmVal} method={method} onComplete={handleConfirm} />
            {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
          </motion.div>
        )}

        {step === "backup" && (
          <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 px-6">
            <h2 className="text-xl font-bold mb-1">Backup password</h2>
            <p className="text-sm text-slate-400 mb-6">Used if you forget your {method} (optional)</p>
            <input
              type="password"
              value={backup}
              onChange={(e) => setBackup(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
            />
            <div className="mt-6 space-y-2">
              <button
                onClick={() => next("biometrics")}
                disabled={backup.length > 0 && backup.length < 6}
                className="w-full h-12 rounded-2xl bg-blue-500 font-bold active:scale-[0.98] transition disabled:opacity-50"
              >
                {backup ? "Continue" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "biometrics" && (
          <motion.div key="bio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 px-6">
            <h2 className="text-xl font-bold mb-1">Quick unlock</h2>
            <p className="text-sm text-slate-400 mb-6">Use biometrics for faster access</p>
            <ToggleCard icon={Fingerprint} title="Fingerprint" desc="Unlock with your finger" value={fingerprint} onChange={setFingerprint} />
            <div className="h-3" />
            <ToggleCard icon={ScanFace} title="Face Unlock" desc="Unlock with your face" value={face} onChange={setFace} />
            <button onClick={finish} className="mt-8 w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 font-bold active:scale-[0.98] transition shadow-lg shadow-blue-500/30">
              Finish Setup
            </button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14 }} className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-6">
              <Check className="h-14 w-14 text-white" strokeWidth={3} />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
            <p className="text-sm text-slate-300">Your app is now secured.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-8" />
    </div>
  );
}

function SecretInput({ method, onComplete }: { method: LockMethod; onComplete: (val: string) => void }) {
  if (method === "pin") {
    return <PinPad length={4} onComplete={onComplete} />;
  }
  if (method === "pattern") {
    return <PatternPad onComplete={onComplete} />;
  }
  return <PasswordInput onComplete={onComplete} />;
}

function PasswordInput({ onComplete }: { onComplete: (val: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <>
      <input
        type="password"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Enter password (6+ chars)"
        className="w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
        autoFocus
      />
      <button
        onClick={() => onComplete(val)}
        disabled={val.length < 6}
        className="mt-4 w-full h-12 rounded-2xl bg-blue-500 font-bold active:scale-[0.98] transition disabled:opacity-50"
      >
        Continue
      </button>
    </>
  );
}

function ToggleCard({ icon: Icon, title, desc, value, onChange }: {
  icon: typeof Fingerprint; title: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => { playClick(); vibrate(8); onChange(!value); }}
      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3"
    >
      <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-left flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <div className={`h-6 w-11 rounded-full p-0.5 transition ${value ? "bg-blue-500" : "bg-white/15"}`}>
        <motion.div animate={{ x: value ? 20 : 0 }} className="h-5 w-5 rounded-full bg-white" />
      </div>
    </button>
  );
}
