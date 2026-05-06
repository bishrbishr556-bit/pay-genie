import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldAlert, AlertCircle, Eye, EyeOff } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { securityActions, useSecurity, getSecurity } from "@/lib/security-store";
import { ForceChangeCredentialScreen } from "./ForceChangeCredentialScreen";

export function AdminPinScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const mustChangeAdmin = useSecurity((s) => s.mustChangeAdmin);
  const [showForce, setShowForce] = useState(false);

  if (showForce && mustChangeAdmin) {
    return (
      <ForceChangeCredentialScreen
        kind="admin"
        onDone={() => { setShowForce(false); onSuccess(); }}
      />
    );
  }

  const submit = () => {
    if (!pwd) return;
    playClick();
    const result = securityActions.verifyAdmin(pwd);
    if (result === "ok") {
      playSuccess(); vibrate([20, 30, 20]);
      setError(false);
      if (getSecurity().mustChangeAdmin) setShowForce(true);
      else onSuccess();
    } else {
      setError(true); vibrate([50, 100, 50]);
      setAttempts((a) => a + 1);
      setTimeout(() => { setPwd(""); setError(false); }, 900);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={() => { playClick(); vibrate(15); onBack(); }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-9">Admin Access</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: error ? [1, 1.1, 0.9, 1] : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`h-20 w-20 rounded-full mb-8 flex items-center justify-center ${
            error ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-purple-500 to-fuchsia-600"
          }`}
        >
          {error ? <AlertCircle className="h-10 w-10 text-white" strokeWidth={2.5} /> : <ShieldAlert className="h-10 w-10 text-white" strokeWidth={2.5} />}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Admin Password</h2>
        <p className="text-sm text-slate-400 mb-8 text-center">
          {error ? `Incorrect — ${attempts >= 5 ? "too many attempts" : "try again"}` : "Enter the admin password to continue"}
        </p>

        <div className="w-full max-w-xs">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Admin password"
              autoFocus
              disabled={attempts >= 5}
              className={`w-full h-12 px-4 pr-11 rounded-2xl bg-slate-800 border outline-none text-white placeholder:text-slate-500 ${
                error ? "border-rose-500" : "border-slate-700 focus:border-purple-400"
              }`}
            />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={submit}
            disabled={!pwd || attempts >= 5}
            className="mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold active:scale-[0.98] disabled:opacity-50"
          >
            Unlock Admin
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-8">Demo password: Admin123 (must be changed on first use)</p>
      </div>
    </div>
  );
}
