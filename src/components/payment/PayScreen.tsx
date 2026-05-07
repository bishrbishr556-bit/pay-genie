import { useEffect, useState } from "react";
import { actions, upiDirectory, playClick, playSuccess, vibrate, useStore } from "@/lib/payment-store";
import { ArrowLeft, CheckCircle2, Loader2, Search, Fingerprint, Delete, Share2, MoreVertical, ChevronUp, Download, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CONTACTS = [
  { name: "Afsal Rahman", upi: "afsal@okbank", color: "bg-blue-500" },
  { name: "Niyas P", upi: "niyas@okbank", color: "bg-emerald-500" },
  { name: "Priya Menon", upi: "priya@okbank", color: "bg-rose-500" },
  { name: "Rahim Khan", upi: "rahim@okbank", color: "bg-amber-500" },
  { name: "Vaani S", upi: "vaani@okbank", color: "bg-purple-500" },
  { name: "Kunal Sharma", upi: "kunal@okbank", color: "bg-cyan-500" },
  { name: "Ranjit Das", upi: "ranjit@okbank", color: "bg-orange-500" },
  { name: "Merchant Cafe", upi: "cafe@okbank", color: "bg-teal-500" },
];

export function PayScreen({ onBack, onShowReward }: { onBack: () => void; onShowReward: (rewardId: string) => void }) {
  const [step, setStep] = useState<"input" | "verify" | "amount" | "auth" | "processing" | "success">("input");
  const [upi, setUpi] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [lastTxn, setLastTxn] = useState<{ amount: number; name: string } | null>(null);
  const [lastRewardId, setLastRewardId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const balance = useStore((s) => s.balance);

  useEffect(() => {
    try {
      const pref = sessionStorage.getItem("gpay-prefill-upi");
      if (pref) {
        sessionStorage.removeItem("gpay-prefill-upi");
        setUpi(pref);
        const found = upiDirectory[pref.toLowerCase()];
        setVerifiedName(found ?? pref.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()));
        setStep("amount");
      }
    } catch { /* ignore */ }
  }, []);

  const verify = () => {
    if (!upi.includes("@")) {
      toast.error("Enter a valid UPI ID");
      return;
    }
    setVerifying(true);
    setVerifiedName(null);
    setTimeout(() => {
      const found = upiDirectory[upi.toLowerCase()];
      if (found) {
        setVerifiedName(found);
        setStep("amount");
      } else {
        // Allow unknown but show generic name
        setVerifiedName(upi.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()));
        setStep("amount");
      }
      setVerifying(false);
    }, 1500);
  };

  const pickContact = (c: { name: string; upi: string }) => {
    playClick();
    vibrate(15);
    setUpi(c.upi);
    setVerifiedName(c.name);
    setStep("amount");
  };

  const proceedToAuth = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
    playClick();
    vibrate(15);
    setPin("");
    setPinError(false);
    setStep("auth");
  };

  const completePayment = () => {
    const amt = parseFloat(amount);
    setStep("processing");
    vibrate(20);
    setTimeout(() => {
      const { reward } = actions.sendMoney(verifiedName!, upi, amt, note || undefined);
      setLastTxn({ amount: amt, name: verifiedName! });
      setLastRewardId(reward.id);
      setStep("success");
      playSuccess();
      vibrate([50, 30, 80]);
      toast(`₹${amt} debited from A/c XX1234`, {
        description: `Sent to ${verifiedName} (${upi})`,
      });
    }, 2000);
  };

  const onPinDigit = (d: string) => {
    if (pin.length >= 4) return;
    playClick();
    vibrate(10);
    const next = pin + d;
    setPin(next);
    setPinError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === "1234") {
          completePayment();
        } else {
          setPinError(true);
          vibrate([60, 40, 60]);
          setTimeout(() => { setPin(""); setPinError(false); }, 700);
        }
      }, 200);
    }
  };

  const onPinDelete = () => {
    playClick();
    setPin((p) => p.slice(0, -1));
  };

  const onFingerprint = () => {
    playClick();
    vibrate(30);
    toast.success("Fingerprint verified");
    setTimeout(completePayment, 600);
  };

  const filteredContacts = CONTACTS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.upi.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border">
        <button onClick={() => { playClick(); onBack(); }} className="active:scale-90 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="font-semibold text-lg">
          {step === "input" && "Pay anyone"}
          {step === "amount" && "Enter amount"}
          {step === "auth" && "Verify to pay"}
          {step === "processing" && "Processing..."}
          {step === "success" && "Payment success"}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Phone number, UPI ID or name"
                className="w-full pl-9 pr-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary"
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggested</p>
              <div className="space-y-1">
                {filteredContacts.map((c) => (
                  <button
                    key={c.upi}
                    onClick={() => pickContact(c)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl active:bg-muted active:scale-[0.99] transition-all"
                  >
                    <div className={`h-10 w-10 rounded-full ${c.color} text-white flex items-center justify-center font-bold`}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.upi}</p>
                    </div>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <button
                    onClick={() => { setUpi(search); verify(); }}
                    disabled={verifying || !search.includes("@")}
                    className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `Pay to "${search}"`}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "amount" && (
          <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 p-5 space-y-5">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                {verifiedName?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm flex items-center gap-1">
                  {verifiedName} <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </p>
                <p className="text-xs text-muted-foreground">{upi}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount (₹)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                className="w-full mt-1 px-4 py-4 bg-muted rounded-xl text-3xl font-bold text-foreground outline-none focus:ring-2 ring-primary"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">Balance: ₹{balance.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Note (optional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dinner, rent..."
                className="w-full mt-1 px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 ring-primary"
              />
            </div>
            <button
              onClick={proceedToAuth}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform"
            >
              Pay ₹{amount || "0"}
            </button>
          </motion.div>
        )}

        {step === "auth" && (
          <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-5">
            <div className="text-center mb-4">
              <p className="text-xs text-muted-foreground">Paying {verifiedName}</p>
              <p className="text-3xl font-bold mt-1">₹{amount}</p>
            </div>
            <p className="text-center text-sm font-semibold mb-3">Enter UPI PIN</p>
            <div className="flex justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    pinError ? "border-rose-500 bg-rose-500" : pin.length > i ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <p className={`text-center text-xs h-4 ${pinError ? "text-rose-500" : "text-muted-foreground"}`}>
              {pinError ? "Wrong PIN, try again" : "Hint: 1234"}
            </p>

            <div className="mt-auto">
              <div className="grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9"].map((d) => (
                  <button
                    key={d}
                    onClick={() => onPinDigit(d)}
                    className="h-14 rounded-2xl bg-muted text-2xl font-semibold active:scale-95 active:bg-muted-foreground/20 transition-all"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={onFingerprint}
                  className="h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-all"
                  aria-label="Fingerprint"
                >
                  <Fingerprint className="h-6 w-6" />
                </button>
                <button
                  onClick={() => onPinDigit("0")}
                  className="h-14 rounded-2xl bg-muted text-2xl font-semibold active:scale-95 active:bg-muted-foreground/20 transition-all"
                >
                  0
                </button>
                <button
                  onClick={onPinDelete}
                  className="h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-all"
                  aria-label="Delete"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-3">🔒 Secured by AI · NPCI</p>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm">Processing payment...</p>
            <p className="text-xs text-muted-foreground">Do not close the app</p>
          </motion.div>
        )}

        {step === "success" && lastTxn && (
          <SuccessReceipt
            key="succ"
            txn={lastTxn}
            upi={upi}
            note={note}
            rewardId={lastRewardId}
            onShowReward={onShowReward}
            onDone={onBack}
            onNewPayment={() => {
              setStep("input");
              setUpi(""); setVerifiedName(null); setAmount(""); setNote("");
              setLastTxn(null); setLastRewardId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessReceipt({
  txn, upi, note, rewardId, onShowReward, onDone, onNewPayment,
}: {
  txn: { amount: number; name: string };
  upi: string;
  note: string;
  rewardId: string | null;
  onShowReward: (id: string) => void;
  onDone: () => void;
  onNewPayment: () => void;
}) {
  const [open, setOpen] = useState(true);
  const now = new Date();
  const dateStr = now.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const upiTxnId = String(Math.floor(400000000000 + Math.random() * 99999999999));
  const refId = "REF" + Math.random().toString(36).slice(2, 12).toUpperCase();
  const bankingName = txn.name.toUpperCase();

  const handleShare = async () => {
    playClick();
    const text = `Payment Successful\n₹${txn.amount} paid to ${txn.name}\nUPI ID: ${upi}\nTxn ID: ${upiTxnId}\n${dateStr}`;
    try {
      if (navigator.share) await navigator.share({ title: "Payment Receipt", text });
      else { await navigator.clipboard.writeText(text); toast.success("Receipt copied"); }
    } catch { /* ignore */ }
  };

  const handleDownload = () => {
    playClick();
    const blob = new Blob([
      `PAYMENT RECEIPT\n----------------\nAmount: ₹${txn.amount}\nPaid to: ${txn.name}\nBanking name: ${bankingName}\nUPI ID: ${upi}\nUPI Txn ID: ${upiTxnId}\nReference: ${refId}\nDate: ${dateStr}\n${note ? `Note: ${note}\n` : ""}`,
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `receipt-${upiTxnId}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  return (
    <motion.div
      key="succ"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-[#f6f7f9] text-slate-900"
    >
      {/* Top action bar */}
      <div className="flex justify-end items-center gap-4 px-5 pt-4">
        <button onClick={handleShare} className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center active:scale-90 transition">
          <Share2 className="h-5 w-5" />
        </button>
        <button onClick={handleDownload} className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center active:scale-90 transition">
          <Download className="h-5 w-5" />
        </button>
        <button className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-2">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} viewBox="0 0 24 24" className="h-9 w-9 text-white">
            <motion.path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.18 }}/>
          </motion.svg>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-3 text-emerald-700 font-medium">
          Payment successful
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-3 text-5xl font-semibold tracking-tight">
          ₹{txn.amount.toLocaleString("en-IN")}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-2 text-slate-700">
          Paid to {txn.name}
        </motion.p>
        <p className="text-xs text-slate-500 mt-1">Banking name: {bankingName}</p>
        <div className="mt-3 px-3 py-1 rounded-full bg-slate-200/70 text-xs text-slate-700">
          UPI ID: {upi}
        </div>
        <p className="text-xs text-slate-500 mt-2">{dateStr}</p>
      </div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mx-5 mt-5 bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
      >
        <button onClick={() => { playClick(); setOpen((o) => !o); }} className="w-full flex items-center gap-3 p-4">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">SBI</div>
          <p className="flex-1 text-left font-semibold text-sm">State Bank of India 1825</p>
          <motion.div animate={{ rotate: open ? 0 : 180 }}>
            <ChevronUp className="h-5 w-5 text-slate-500" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 text-sm space-y-3"
            >
              <Field label="UPI transaction ID" value={upiTxnId} />
              <Field label={`To: ${bankingName}`} value={upi} />
              <Field label="From: YOU (State Bank of India)" value="you1234@sbi" />
              <Field label="Reference ID" value={refId} />
              {note && <Field label="Note" value={note} />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* UPI badge */}
      <p className="text-center text-[10px] tracking-widest text-slate-400 mt-5">POWERED BY</p>
      <p className="text-center font-bold text-slate-500 italic">UPI</p>

      {rewardId && (
        <div className="px-5 mt-4">
          <button
            onClick={() => onShowReward(rewardId)}
            className="w-full gradient-gold text-slate-900 font-bold py-3 rounded-2xl shadow-card active:scale-[0.98] transition"
          >
            🎁 You won a scratch card!
          </button>
        </div>
      )}

      {/* Trust illustration */}
      <div className="relative mt-6 h-24 flex items-end justify-center overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-100/80 to-transparent" />
        <ShieldCheck className="relative h-14 w-14 text-blue-500 mb-2" />
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3 px-5 py-4 sticky bottom-0 bg-[#f6f7f9]"
      >
        <button
          onClick={onNewPayment}
          className="flex-1 h-12 rounded-full border-2 border-blue-600 text-blue-700 font-semibold active:scale-[0.98] transition"
        >
          New payment
        </button>
        <button
          onClick={onDone}
          className="flex-1 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-600">{label}</p>
      <p className="text-slate-900">{value}</p>
    </div>
  );
}