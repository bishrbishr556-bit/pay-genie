import { useState } from "react";
import { actions, upiDirectory, playClick, playSuccess, vibrate, useStore } from "@/lib/payment-store";
import { ArrowLeft, CheckCircle2, Loader2, Search, Fingerprint, Delete } from "lucide-react";
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
          <motion.div key="succ" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-elevated"
            >
              <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2.5} />
            </motion.div>
            <p className="text-2xl font-bold">₹{lastTxn.amount}</p>
            <p className="text-muted-foreground text-sm">Paid to {lastTxn.name}</p>
            {lastRewardId && (
              <button
                onClick={() => onShowReward(lastRewardId)}
                className="mt-4 gradient-gold text-slate-900 font-bold py-3 px-6 rounded-xl shadow-card active:scale-95 transition-transform"
              >
                🎁 You won a scratch card!
              </button>
            )}
            <button
              onClick={onBack}
              className="mt-2 text-primary text-sm font-semibold"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}