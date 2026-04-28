import { useState } from "react";
import { actions, upiDirectory, playClick, playSuccess, vibrate, useStore } from "@/lib/payment-store";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function PayScreen({ onBack, onShowReward }: { onBack: () => void; onShowReward: (rewardId: string) => void }) {
  const [step, setStep] = useState<"input" | "verify" | "amount" | "processing" | "success">("input");
  const [upi, setUpi] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [lastTxn, setLastTxn] = useState<{ amount: number; name: string } | null>(null);
  const [lastRewardId, setLastRewardId] = useState<string | null>(null);
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

  const send = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border">
        <button onClick={() => { playClick(); onBack(); }} className="active:scale-90 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="font-semibold text-lg">
          {step === "input" && "Pay to UPI ID"}
          {step === "amount" && "Enter amount"}
          {step === "processing" && "Processing..."}
          {step === "success" && "Payment success"}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">UPI ID</label>
              <input
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                placeholder="name@bank"
                className="w-full mt-1 px-4 py-3 bg-muted rounded-xl text-foreground outline-none focus:ring-2 ring-primary"
                autoFocus
              />
              {verifying && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Try: anas@okbank, rahim@upi, nabeel@ybl</p>
            <button
              onClick={verify}
              disabled={verifying}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              Continue
            </button>
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
              onClick={send}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform"
            >
              Pay ₹{amount || "0"}
            </button>
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