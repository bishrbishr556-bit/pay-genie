import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, KeyRound, Grid3x3, Lock, ChevronLeft, Check } from "lucide-react";
import { actions, playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { securityActions, useSecurity, type LockMethod } from "@/lib/security-store";
import { PinPad } from "./security/PinPad";
import { PatternPad } from "./security/PatternPad";
import { toast } from "sonner";

type Mode = "lock" | "forgot" | "reset" | "face" | "fingerprint";

export function SecureLockScreen() {
  const primary = useSecurity((s) => s.primary);
  const fingerprintEnabled = useSecurity((s) => s.fingerprintEnabled);
  const faceEnabled = useSecurity((s) => s.faceEnabled);
  const lockedUntil = useSecurity((s) => s.lockedUntil);
  const failedAttempts = useSecurity((s) => s.failedAttempts);
  const backupAvailable = useSecurity((s) => !!s.backupPasswordHash);

  const [method, setMethod] = useState<LockMethod>(primary ?? "pin");
  const [mode, setMode] = useState<Mode>("lock");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [scanning, setScanning] = useState(false);

  useEffect(() => { setMethod(primary ?? "pin"); }, [primary]);
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, []);

  const locked = lockedUntil && lockedUntil > now;
  const remainingSecs = locked ? Math.ceil((lockedUntil! - now) / 1000) : 0;

  const handleSecret = (val: string) => {
    if (locked) return;
    const result = securityActions.verify(val, method);
    if (result === "ok") {
      setSuccess(true); playSuccess(); vibrate([15, 25, 15]);
      setTimeout(() => actions.unlock(), 700);
    } else if (result === "decoy") {
      playSuccess();
      toast.message("Privacy mode active");
      actions.unlock();
    } else {
      setShake(true); vibrate([40, 50, 40]);
      setError(`Incorrect — ${5 - failedAttempts - 1} attempts left`);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(""), 2200);
    }
  };

  const triggerBiometric = (kind: "fingerprint" | "face") => {
    if (locked) return;
    setMode(kind); setScanning(true); vibrate(20);
    setTimeout(() => {
      securityActions.verifyBiometric();
      setScanning(false); setSuccess(true); playSuccess(); vibrate([15, 25, 15]);
      setTimeout(() => actions.unlock(), 600);
    }, 1500);
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
          <Check className="h-14 w-14 text-white" strokeWidth={3} />
        </motion.div>
        <p className="mt-5 text-white font-bold text-lg">Unlocked</p>
      </div>
    );
  }

  if (mode === "fingerprint" || mode === "face") {
    return <BiometricScreen kind={mode} scanning={scanning} onCancel={() => { setMode("lock"); setScanning(false); }} />;
  }

  if (mode === "forgot") {
    return <ForgotScreen onBack={() => setMode("lock")} onReset={() => { toast.success("PIN reset successful"); setMode("lock"); }} />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-400"
            style={{ left: `${15 + i * 14}%`, top: `${20 + i * 10}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="pt-12 pb-4 text-center relative z-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-16 w-16 mx-auto rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold shadow-lg">
          U
        </motion.div>
        <p className="mt-3 font-bold text-xl">Welcome Back</p>
        <p className="text-xs opacity-70 mt-1">
          {locked ? `Locked — try in ${remainingSecs}s` : `Enter your ${method} to continue`}
        </p>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={method} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
            {method === "pin" && (
              <PinPad
                length={4}
                onComplete={handleSecret}
                shake={shake}
                showBiometric={fingerprintEnabled}
                onBiometric={() => triggerBiometric("fingerprint")}
                initialError={error}
              />
            )}
            {method === "pattern" && (
              <>
                <PatternPad onComplete={handleSecret} shake={shake} />
                {error && <p className="text-rose-400 text-sm text-center mt-3">{error}</p>}
              </>
            )}
            {method === "password" && (
              <PasswordEntry onSubmit={handleSecret} shake={shake} error={error} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom options */}
      <div className="pb-8 px-6 relative z-10">
        <div className="flex justify-center gap-3 mb-4">
          {faceEnabled && (
            <button onClick={() => triggerBiometric("face")} className="flex flex-col items-center gap-1 active:scale-90">
              <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center">
                <ScanFace className="h-5 w-5" />
              </div>
              <span className="text-[10px] opacity-70">Face</span>
            </button>
          )}
          {fingerprintEnabled && method !== "pin" && (
            <button onClick={() => triggerBiometric("fingerprint")} className="flex flex-col items-center gap-1 active:scale-90">
              <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="text-[10px] opacity-70">Touch</span>
            </button>
          )}
        </div>

        <div className="flex justify-center gap-2 text-[11px]">
          {(["pin", "pattern", "password"] as LockMethod[]).filter((m) => m !== method).map((m) => (
            <button
              key={m}
              onClick={() => { playClick(); setMethod(m); setError(""); }}
              className="px-3 py-1.5 rounded-full bg-white/10 active:scale-95 flex items-center gap-1"
            >
              {m === "pin" ? <Lock className="h-3 w-3" /> : m === "pattern" ? <Grid3x3 className="h-3 w-3" /> : <KeyRound className="h-3 w-3" />}
              Use {m}
            </button>
          ))}
        </div>

        {backupAvailable && (
          <button onClick={() => { playClick(); setMode("forgot"); }} className="mt-3 w-full text-center text-xs text-blue-300 underline">
            Forgot {method}?
          </button>
        )}
      </div>
    </div>
  );
}

function PasswordEntry({ onSubmit, shake, error }: { onSubmit: (v: string) => void; shake: boolean; error: string }) {
  const [val, setVal] = useState("");
  return (
    <motion.div animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}} className="space-y-3">
      <input
        type="password"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(val)}
        placeholder="Password"
        className="w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
        autoFocus
      />
      {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
      <button onClick={() => { onSubmit(val); setVal(""); }} className="w-full h-12 rounded-2xl bg-blue-500 font-bold active:scale-[0.98] transition">
        Unlock
      </button>
    </motion.div>
  );
}

function BiometricScreen({ kind, scanning, onCancel }: { kind: "fingerprint" | "face"; scanning: boolean; onCancel: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
      <button onClick={onCancel} className="absolute top-10 left-5 h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
        <ChevronLeft className="h-5 w-5" />
      </button>
      {kind === "fingerprint" ? (
        <div className="relative">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute inset-0 rounded-full bg-blue-400/40 blur-2xl" />
          <motion.div animate={scanning ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.8, repeat: Infinity }} className="relative h-32 w-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <Fingerprint className="h-16 w-16 text-blue-300" />
          </motion.div>
        </div>
      ) : (
        <div className="relative">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-purple-400/30 blur-3xl" />
          <div className="relative h-44 w-44 rounded-full border-4 border-blue-400/60 flex items-center justify-center overflow-hidden">
            <ScanFace className="h-24 w-24 text-blue-200/80" />
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-lg shadow-cyan-300"
            />
          </div>
        </div>
      )}
      <p className="mt-8 font-semibold">{scanning ? "Scanning..." : "Get ready"}</p>
      <p className="text-xs opacity-60 mt-1">{kind === "face" ? "Look at the screen" : "Place your finger on the sensor"}</p>
    </div>
  );
}

function ForgotScreen({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  const [step, setStep] = useState<"backup" | "newpin">("backup");
  const [backup, setBackup] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  const verify = () => {
    if (securityActions.resetWithBackup(backup, "0000")) {
      setStep("newpin");
    } else {
      setError("Incorrect backup password"); vibrate([40, 50, 40]);
    }
  };

  const setNew = (val: string) => {
    if (securityActions.resetWithBackup(backup, val)) {
      playSuccess(); vibrate([20, 30, 20]);
      onReset();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white px-6">
      <div className="pt-12 pb-4 flex items-center">
        <button onClick={onBack} className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="ml-2 font-bold">Reset {step === "backup" ? "with backup" : "PIN"}</h1>
      </div>
      {step === "backup" ? (
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm text-slate-400 mb-4">Enter your backup password to continue</p>
          <input
            type="password"
            value={backup}
            onChange={(e) => setBackup(e.target.value)}
            placeholder="Backup password"
            className="w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
            autoFocus
          />
          {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
          <button onClick={verify} className="mt-4 w-full h-12 rounded-2xl bg-blue-500 font-bold active:scale-[0.98]">
            Verify
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm text-slate-400 mb-6 text-center">Set a new 4-digit PIN</p>
          <PinPad length={4} onComplete={setNew} />
        </div>
      )}
    </div>
  );
}
