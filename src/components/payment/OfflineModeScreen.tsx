import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, WifiOff, Wifi, ShieldCheck, Trash2, RefreshCw, Check, Clock,
  ArrowUpRight, Loader2, Lock, Send, QrCode, Gift, Smartphone, Building2,
  Users, History as HistoryIcon, Sparkles, Bell, Eye, EyeOff,
} from "lucide-react";
import { initOffline, useOffline, offlineActions, onSync } from "@/lib/offline-mode";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

type View = "main" | "setup" | "otp" | "unlock" | "pay" | "processing" | "success";

export function OfflineModeScreen({ onBack }: { onBack: () => void }) {
  useEffect(() => { initOffline(); }, []);
  const enabled = useOffline((s) => s.enabled);
  const profile = useOffline((s) => s.profile);
  const txns = useOffline((s) => s.txns);
  const syncing = useOffline((s) => s.syncing);

  const [view, setView] = useState<View>("main");
  const [authed, setAuthed] = useState(false);
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  // setup form
  const [sName, setSName] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sPin, setSPin] = useState("");
  const [sOtp, setSOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [hideBal, setHideBal] = useState(false);

  // unlock pin
  const [uPin, setUPin] = useState("");

  // pay form
  const [pTo, setPTo] = useState("");
  const [pUpi, setPUpi] = useState("");
  const [pAmount, setPAmount] = useState("");
  const [pNote, setPNote] = useState("");
  const [payPin, setPayPin] = useState("");
  const [processStep, setProcessStep] = useState("");
  const [lastTxn, setLastTxn] = useState<{ to: string; amount: number; id: string } | null>(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Auto-sync notification when connectivity returns
  useEffect(() => {
    const off = onSync((n) => {
      playSuccess(); vibrate([20, 30, 20]);
      toast.success(`✔ ${n} pending transaction${n > 1 ? "s" : ""} synced`, {
        description: "Internet restored — all offline payments completed",
      });
    });
    return off;
  }, []);

  const tap = (fn?: () => void) => () => { playClick(); vibrate(15); fn?.(); };

  const handleToggle = () => {
    playClick(); vibrate(15);
    if (!enabled) {
      setView("setup");
    } else {
      offlineActions.disable();
      setAuthed(false);
      toast.success("Offline mode disabled");
    }
  };

  const handleEnable = () => {
    if (sName.trim().length < 2) { toast.error("Enter your name"); return; }
    if (!/^\+?\d{7,15}$/.test(sPhone.replace(/\s/g, ""))) { toast.error("Enter a valid phone"); return; }
    // Generate demo OTP and move to OTP step
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setDemoOtp(otp);
    setSOtp("");
    vibrate(15);
    toast.success(`Demo OTP sent: ${otp}`, { duration: 6000 });
    setView("otp");
  };

  const handleVerifyOtp = () => {
    if (!/^\d{4}$/.test(sOtp)) { toast.error("Enter 4-digit OTP"); return; }
    if (sOtp !== demoOtp) { toast.error("Wrong OTP"); vibrate([60,40,60]); return; }
    if (!/^\d{4}$/.test(sPin)) { toast.error("Set a 4-digit PIN"); return; }
    offlineActions.enable({ name: sName, phone: sPhone, pin: sPin });
    playSuccess(); vibrate([20, 30, 20]);
    setSName(""); setSPhone(""); setSPin(""); setSOtp(""); setDemoOtp("");
    setAuthed(true);
    setView("main");
    toast.success("Offline mode enabled");
  };

  const handleUnlock = () => {
    if (offlineActions.verifyPin(uPin)) {
      setAuthed(true); setUPin(""); setView("main");
      playSuccess(); vibrate(20);
    } else {
      toast.error("Wrong PIN"); vibrate([60, 40, 60]); setUPin("");
    }
  };

  const handlePay = async () => {
    const amt = Number(pAmount);
    if (!pTo.trim()) { toast.error("Enter recipient"); return; }
    if (!pUpi.trim()) { toast.error("Enter UPI / phone"); return; }
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    if (!offlineActions.verifyPin(payPin)) { toast.error("Wrong PIN"); vibrate([60, 40, 60]); return; }

    setView("processing");
    const steps = ["Connecting to bank…", "Verifying details…", "Processing payment…", "Saving offline…"];
    for (const s of steps) {
      setProcessStep(s);
      await new Promise((r) => setTimeout(r, 650));
    }
    const txn = offlineActions.addTxn({ to: pTo.trim(), upi: pUpi.trim(), amount: amt, note: pNote.trim() || undefined });
    setLastTxn({ to: txn.to, amount: txn.amount, id: txn.id });
    playSuccess(); vibrate([20, 40, 20]);
    setView("success");
    // clear form, but stay on success until user dismisses
    setPTo(""); setPUpi(""); setPAmount(""); setPNote(""); setPayPin("");
  };

  const handleSync = async () => {
    if (!online) { toast.error("You're offline — connect to sync"); return; }
    const n = await offlineActions.syncPending();
    if (n > 0) { playSuccess(); toast.success(`${n} transaction${n > 1 ? "s" : ""} synced`); }
    else toast.message("Nothing to sync");
  };

  // Auto-prompt unlock when entering enabled mode
  useEffect(() => {
    if (enabled && !authed && view === "main") setView("unlock");
  }, [enabled, authed, view]);

  const pendingCount = txns.filter((t) => t.status === "pending").length;

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur px-4 pt-3 pb-3 flex items-center">
        <button onClick={tap(onBack)} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">Offline Mode</h1>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP */}
        {view === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 pt-3">
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/10 border border-orange-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <WifiOff className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-bold text-orange-300">Enable Offline Mode</p>
              </div>
              <p className="text-xs text-slate-400">Create a secure local profile. Transactions will be saved locally and synced when online.</p>
            </div>

            <div className="space-y-3">
              <Field label="Name">
                <input value={sName} onChange={(e) => setSName(e.target.value)} maxLength={40} placeholder="Your name" className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" />
              </Field>
              <Field label="Phone">
                <input value={sPhone} onChange={(e) => setSPhone(e.target.value)} inputMode="tel" maxLength={16} placeholder="+91 98765 43210" className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" />
              </Field>
              <Field label="Create 4-digit PIN">
                <input value={sPin} onChange={(e) => setSPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" type="password" placeholder="••••" className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500 tracking-[0.5em] text-center" />
              </Field>
            </div>

            <button onClick={tap(handleEnable)} className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold active:scale-[0.98] transition shadow-lg shadow-orange-900/40">
              Send OTP
            </button>
            <button onClick={tap(() => setView("main"))} className="mt-2 w-full h-10 rounded-xl text-slate-400 text-sm">Cancel</button>
          </motion.div>
        )}

        {/* OTP */}
        {view === "otp" && (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 pt-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4 text-center">
              <p className="text-xs text-slate-300">Demo OTP sent to <b>{sPhone}</b></p>
              <p className="text-2xl font-bold tracking-[0.4em] text-emerald-400 mt-1">{demoOtp}</p>
              <p className="text-[10px] text-slate-500 mt-1">(Auto-shown for demo only)</p>
            </div>
            <Field label="Enter 4-digit OTP">
              <input value={sOtp} onChange={(e) => setSOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="••••" className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-lg outline-none focus:border-emerald-500 tracking-[0.6em] text-center" />
            </Field>
            <button onClick={tap(handleVerifyOtp)} disabled={sOtp.length !== 4} className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold active:scale-[0.98] transition disabled:opacity-50">
              Verify & Continue
            </button>
            <button onClick={tap(() => { const o = String(Math.floor(1000+Math.random()*9000)); setDemoOtp(o); toast.success(`New OTP: ${o}`); })} className="mt-2 w-full h-10 rounded-xl text-slate-400 text-sm">Resend OTP</button>
            <button onClick={tap(() => setView("setup"))} className="mt-1 w-full h-10 rounded-xl text-slate-500 text-xs">Back</button>
          </motion.div>
        )}

        {/* UNLOCK */}
        {view === "unlock" && enabled && (
          <motion.div key="unlock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-3">
              <Lock className="h-7 w-7 text-orange-400" />
            </div>
            <p className="font-bold">Enter Offline PIN</p>
            <p className="text-xs text-slate-400 mb-4">Hi {profile?.name}, unlock to continue</p>
            <input
              autoFocus
              value={uPin}
              onChange={(e) => setUPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              type="password"
              placeholder="••••"
              className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500 tracking-[0.6em] text-center text-xl max-w-[180px] mx-auto"
            />
            <button onClick={tap(handleUnlock)} disabled={uPin.length !== 4} className="mt-4 w-full max-w-[220px] mx-auto h-11 rounded-xl bg-emerald-500 font-bold disabled:opacity-50 block">
              Unlock
            </button>
            <button onClick={tap(onBack)} className="mt-2 text-xs text-slate-400">Back</button>
          </motion.div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="font-semibold">{processStep}</p>
            <p className="text-xs text-slate-400 mt-1">Please wait…</p>
          </motion.div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <p className="font-bold text-xl">Payment Successful</p>
            {lastTxn && (
              <>
                <p className="text-3xl font-extrabold mt-3">₹{lastTxn.amount.toLocaleString("en-IN")}</p>
                <p className="text-sm text-slate-300 mt-1">sent to <b>{lastTxn.to}</b></p>
                <div className="mt-4 inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-[11px] font-semibold text-orange-300">Status: Pending Sync</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Txn ID: {lastTxn.id.slice(0, 12).toUpperCase()}</p>
                <p className="text-[10px] text-slate-500">{new Date().toLocaleString()}</p>
              </>
            )}
            <button
              onClick={tap(() => { setLastTxn(null); setView("main"); })}
              className="mt-6 w-full h-12 rounded-xl bg-emerald-500 font-bold active:scale-[0.98] transition"
            >
              Done
            </button>
          </motion.div>
        )}

        {/* PAY */}
        {view === "pay" && (
          <motion.div key="pay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-3">
            <div className="space-y-3">
              <Field label="Recipient name"><input value={pTo} onChange={(e) => setPTo(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" placeholder="John" /></Field>
              <Field label="UPI / Phone"><input value={pUpi} onChange={(e) => setPUpi(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" placeholder="john@upi" /></Field>
              <Field label="Amount (₹)"><input value={pAmount} onChange={(e) => setPAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" placeholder="0" /></Field>
              <Field label="Note (optional)"><input value={pNote} onChange={(e) => setPNote(e.target.value)} maxLength={60} className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500" placeholder="Lunch" /></Field>
              <Field label="Confirm PIN">
                <input value={payPin} onChange={(e) => setPayPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" type="password" className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-emerald-500 tracking-[0.5em] text-center" placeholder="••••" />
              </Field>
            </div>
            <button onClick={tap(handlePay)} className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold active:scale-[0.98] transition">
              Pay Offline
            </button>
            <button onClick={tap(() => setView("main"))} className="mt-2 w-full h-10 rounded-xl text-slate-400 text-sm">Cancel</button>
          </motion.div>
        )}

        {/* MAIN */}
        {view === "main" && (!enabled || authed) && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-3">
            {/* Status card */}
            <div className={`rounded-2xl p-4 border ${enabled ? "bg-gradient-to-br from-orange-600/20 to-red-600/10 border-orange-500/30" : "bg-slate-900 border-slate-800"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${enabled ? "bg-orange-500/20" : "bg-slate-800"}`}>
                    {enabled ? <WifiOff className="h-5 w-5 text-orange-400" /> : <Wifi className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{enabled ? "Offline Mode: ON" : "Offline Mode: OFF"}</p>
                    <p className="text-[11px] text-slate-400">{enabled ? "Use app without internet" : "Enable to use without internet"}</p>
                  </div>
                </div>
                <Toggle on={enabled} onChange={handleToggle} />
              </div>
              {enabled && (
                <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
                  All transactions will be saved locally and synced when online.
                </p>
              )}
            </div>

            {enabled && (
              <>
                {/* Demo balance card (clone of home) */}
                <div className="mt-4 relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] opacity-90">
                        <span>Demo Balance</span>
                        <button onClick={tap(() => setHideBal((v) => !v))} className="opacity-90">
                          {hideBal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                      <p className="text-3xl font-bold mt-1">{hideBal ? "₹ ••••••" : "₹5,000.00"}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">A/C ••••0000 · Offline Wallet</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                      <WifiOff className="h-3 w-3" /> Offline
                    </span>
                  </div>
                  <p className="relative text-[10px] mt-3 bg-white/15 rounded-full px-2 py-1 inline-block">📡 Offline Mode Active · all txns pending sync</p>
                </div>

                {/* Profile */}
                <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center font-bold">
                    {(profile?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{profile?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{profile?.phone}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Secured
                  </span>
                </div>

                {/* Quick Actions */}
                <h3 className="mt-5 mb-2 text-[11px] font-bold tracking-[0.12em] text-slate-400 px-1">⚡ QUICK ACTIONS</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-4 gap-2">
                  <Tile icon={Send} label="Send" color="from-blue-500 to-blue-600" onClick={() => setView("pay")} />
                  <Tile icon={QrCode} label="Scan" color="from-purple-500 to-fuchsia-600" onClick={() => { toast.success("📷 QR detected: Rahim @upi"); setPTo("Rahim"); setPUpi("rahim@upi"); setView("pay"); }} />
                  <Tile icon={ArrowUpRight} label="Pay" color="from-emerald-500 to-teal-600" onClick={() => setView("pay")} />
                  <Tile icon={Sparkles} label="More" color="from-slate-500 to-slate-700" onClick={() => toast.message("More options coming")} />
                </div>

                {/* Send Money */}
                <h3 className="mt-5 mb-2 text-[11px] font-bold tracking-[0.12em] text-slate-400 px-1">💸 SEND MONEY TO</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-4 gap-2">
                  <Tile icon={Smartphone} label="Mobile" color="from-emerald-500 to-teal-600" onClick={() => setView("pay")} />
                  <Tile icon={Building2} label="Bank" color="from-violet-500 to-purple-600" onClick={() => setView("pay")} />
                  <Tile icon={QrCode} label="UPI" color="from-pink-500 to-rose-600" onClick={() => setView("pay")} />
                  <Tile icon={Users} label="Contacts" color="from-blue-500 to-indigo-600" onClick={() => { setPTo("Rahim"); setPUpi("rahim@upi"); setView("pay"); }} />
                </div>

                {/* Games / Rewards */}
                <h3 className="mt-5 mb-2 text-[11px] font-bold tracking-[0.12em] text-slate-400 px-1">🎮 PLAY & EARN</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-4 gap-2">
                  <Tile icon={Gift} label="Spin" color="from-purple-600 to-violet-700" onClick={() => { const r = 10 + Math.floor(Math.random()*90); playSuccess(); toast.success(`🎡 You won ₹${r} (offline reward)`); }} />
                  <Tile icon={Gift} label="Scratch" color="from-emerald-600 to-green-700" onClick={() => { playSuccess(); toast.success("🪙 +₹15 cashback (offline)"); }} />
                  <Tile icon={Gift} label="Quiz" color="from-blue-600 to-indigo-700" onClick={() => toast.message("❓ Quiz unlocks when online") } />
                  <Tile icon={Gift} label="Lucky" color="from-rose-600 to-red-700" onClick={() => { playSuccess(); toast.success("🎁 Lucky bonus added!"); }} />
                </div>

                {/* Sync */}
                <button onClick={tap(handleSync)} disabled={syncing} className="mt-5 w-full h-12 rounded-2xl bg-slate-800 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60">
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Sync Pending ({pendingCount})
                </button>

                {/* Connection status */}
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
                  {online ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                      <Wifi className="h-3 w-3" /> Online — auto-sync enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400">
                      <WifiOff className="h-3 w-3" /> No internet
                    </span>
                  )}
                </div>

                {/* History */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-[11px] font-bold tracking-[0.12em] text-slate-400">OFFLINE TRANSACTIONS</h2>
                    {txns.length > 0 && (
                      <button onClick={tap(() => { offlineActions.clear(); offlineActions.enable({ name: profile!.name, phone: profile!.phone, pin: "0000" }); })} className="hidden">reset</button>
                    )}
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
                    {txns.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-8">No offline transactions yet</p>
                    ) : (
                      txns.slice(0, 20).map((t) => (
                        <div key={t.id} className="p-3.5 flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${t.status === "synced" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"}`}>
                            {t.status === "synced" ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate">{t.to}</p>
                            <p className="text-[11px] text-slate-400 truncate">{t.upi} · {new Date(t.ts).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-bold">₹{t.amount}</p>
                            <p className={`text-[10px] font-semibold ${t.status === "synced" ? "text-emerald-400" : "text-orange-400"}`}>
                              {t.status === "synced" ? "Synced ✔" : "Pending ⏳"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Danger */}
                <button
                  onClick={tap(() => { offlineActions.clear(); setAuthed(false); toast.success("Offline data cleared"); })}
                  className="mt-5 w-full h-11 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <Trash2 className="h-4 w-4" /> Clear Offline Data
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 px-1">{label}</span>
      {children}
    </label>
  );
}

function Tile({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={() => { playClick(); vibrate(10); onClick(); }} className="flex flex-col items-center gap-1.5 p-2 rounded-xl active:scale-90 transition">
      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-[10px] text-slate-300 font-medium">{label}</span>
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-orange-500" : "bg-slate-700"}`}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow ${on ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}
