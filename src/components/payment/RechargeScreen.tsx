import { useState } from "react";
import { ArrowLeft, Smartphone, Zap, Tv, Droplet, CheckCircle2, Loader2, Flame, PhoneCall, Wifi, Cylinder, Landmark, Building2, Car, PlayCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { actions, playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

export type RechargeKind =
  | "mobile" | "electric" | "dth" | "water"
  | "gas" | "landline" | "broadband" | "cylinder"
  | "tax" | "municipal" | "fastag" | "googleplay" | "ccpayment";

const META: Record<RechargeKind, { title: string; icon: LucideIcon; accent: string; field: string; placeholder: string; ops: string[] }> = {
  mobile:   { title: "Mobile Recharge",  icon: Smartphone, accent: "from-emerald-500 to-teal-600", field: "Mobile number",  placeholder: "Enter 10-digit mobile",  ops: ["Airtel", "Jio", "Vi", "BSNL"] },
  electric: { title: "Electricity Bill", icon: Zap,        accent: "from-amber-500 to-orange-600", field: "Consumer number",placeholder: "Enter consumer no.",     ops: ["KSEB", "Adani", "Tata Power", "BESCOM"] },
  dth:      { title: "DTH Recharge",     icon: Tv,         accent: "from-rose-500 to-pink-600",    field: "Subscriber ID",  placeholder: "Enter subscriber ID",    ops: ["Tata Play", "Airtel DTH", "Dish TV", "Sun Direct"] },
  water:    { title: "Water Bill",       icon: Droplet,    accent: "from-sky-500 to-blue-600",     field: "RR / Connection",placeholder: "Enter connection no.",   ops: ["KWA", "BWSSB", "DJB", "MCGM"] },
  gas:      { title: "Gas Booking",      icon: Flame,      accent: "from-pink-500 to-rose-600",    field: "Consumer ID",    placeholder: "Enter consumer ID",      ops: ["Indane", "HP Gas", "Bharat Gas"] },
  landline: { title: "Landline Bill",    icon: PhoneCall,  accent: "from-cyan-500 to-blue-600",    field: "Phone number",   placeholder: "STD + number",           ops: ["BSNL", "MTNL", "Airtel"] },
  broadband:{ title: "Broadband Bill",   icon: Wifi,       accent: "from-blue-500 to-indigo-600",  field: "Account / Login",placeholder: "Account ID",             ops: ["Airtel Xstream", "JioFiber", "ACT", "BSNL"] },
  cylinder: { title: "Cylinder Booking", icon: Cylinder,   accent: "from-rose-500 to-red-600",     field: "Consumer ID",    placeholder: "LPG ID",                 ops: ["Indane", "HP Gas", "Bharat Gas"] },
  tax:      { title: "Tax Payment",      icon: Landmark,   accent: "from-emerald-500 to-green-700",field: "PAN",            placeholder: "ABCDE1234F",             ops: ["Income Tax", "Advance Tax", "TDS"] },
  municipal:{ title: "Municipal Tax",    icon: Building2,  accent: "from-violet-500 to-purple-700",field: "Property ID",    placeholder: "PID / Khata no.",        ops: ["BBMP", "MCGM", "GHMC", "PMC"] },
  fastag:   { title: "FASTag Recharge",  icon: Car,        accent: "from-blue-500 to-cyan-700",    field: "Vehicle number", placeholder: "KA01AB1234",             ops: ["Paytm FASTag", "ICICI", "HDFC", "SBI"] },
  googleplay:{title: "Google Play Recharge",icon: PlayCircle,accent: "from-fuchsia-500 to-purple-700", field: "Email", placeholder: "Google account email", ops: ["₹100", "₹500", "₹1000", "Custom"] },
  ccpayment:{ title: "Credit Card Payment", icon: CreditCard,accent: "from-orange-500 to-red-600", field: "Card number",    placeholder: "•••• •••• •••• ••••",    ops: ["HDFC", "SBI", "ICICI", "Axis", "Amex"] },
};

type Step = "form" | "processing" | "success";

export function RechargeScreen({ kind, onBack }: { kind: RechargeKind; onBack: () => void }) {
  const meta = META[kind];
  const Icon = meta.icon;
  const [op, setOp] = useState(meta.ops[0]);
  const [num, setNum] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [txnId, setTxnId] = useState("");

  const valid = num.length >= 6 && Number(amount) > 0;

  const proceed = () => {
    if (!valid) return;
    playClick(); vibrate(20);
    setStep("processing");
    setTimeout(() => {
      const t = actions.sendMoney(`${op} ${meta.title}`, `${op.toLowerCase()}@biller`, Number(amount), meta.title);
      setTxnId(t.txn.id.slice(0, 10).toUpperCase());
      playSuccess(); vibrate([30, 20, 60]);
      setStep("success");
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className={`bg-gradient-to-br ${meta.accent} text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-card`}>
        <button onClick={() => { playClick(); vibrate(15); onBack(); }}
          className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center mb-3 active:scale-90 transition-transform">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">{meta.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="f" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <label className="text-xs font-semibold text-muted-foreground">Operator</label>
              <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                {meta.ops.map((o) => (
                  <button key={o} onClick={() => { playClick(); setOp(o); }}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${op === o ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                    {o}
                  </button>
                ))}
              </div>

              <label className="text-xs font-semibold text-muted-foreground">{meta.field}</label>
              <input value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))}
                placeholder={meta.placeholder}
                className="w-full mt-2 mb-4 bg-card border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted-foreground">Amount</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold">₹</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric" placeholder="0"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-base font-semibold outline-none focus:border-primary" />
              </div>
              <div className="flex gap-2 mt-2 mb-6">
                {[199, 299, 499, 999].map((q) => (
                  <button key={q} onClick={() => { playClick(); setAmount(String(q)); }}
                    className="flex-1 py-2 rounded-lg bg-muted text-xs font-semibold active:scale-95 transition-transform">
                    ₹{q}
                  </button>
                ))}
              </div>

              <button disabled={!valid} onClick={proceed}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform shadow-lg">
                Pay ₹{amount || "0"}
              </button>
              <p className="text-[11px] text-center text-muted-foreground mt-3">🔒 Bank-level security · Secured by UPI</p>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
              <p className="font-semibold">Processing payment securely…</p>
              <p className="text-xs text-muted-foreground mt-1">Connecting to {op}</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="s" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                className="h-20 w-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/40">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold">Payment Successful</h2>
              <p className="text-3xl font-bold mt-2 text-emerald-600">₹{amount}</p>
              <div className="bg-card rounded-2xl shadow-card p-4 mt-5 text-left text-sm space-y-2">
                <Row k="Operator" v={op} />
                <Row k={meta.field} v={num} />
                <Row k="Txn ID" v={txnId} />
                <Row k="Date" v={new Date().toLocaleString()} />
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => { playClick(); vibrate(15); toast.success("Receipt saved"); }}
                  className="flex-1 py-3 rounded-xl bg-muted font-semibold text-sm">📥 Receipt</button>
                <button onClick={onBack}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Done</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold text-right break-all">{v}</span>
    </div>
  );
}