import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Plus, Minus, Users, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { actions, playClick, playSuccess, vibrate } from "@/lib/payment-store";

const FRIENDS = [
  { id: "1", name: "Rahim K", upi: "rahim@upi", color: "bg-blue-500" },
  { id: "2", name: "Priya", upi: "priya@okhdfc", color: "bg-rose-500" },
  { id: "3", name: "Anas P", upi: "anas@okbank", color: "bg-emerald-500" },
  { id: "4", name: "Nabeel", upi: "nabeel@ybl", color: "bg-amber-500" },
  { id: "5", name: "Meera", upi: "meera@oksbi", color: "bg-purple-500" },
  { id: "6", name: "Ravi K", upi: "ravi@paytm", color: "bg-cyan-500" },
];

type Step = "form" | "review" | "processing" | "success";

export function SplitBillScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [total, setTotal] = useState("");
  const [title, setTitle] = useState("Dinner");
  const [picked, setPicked] = useState<string[]>([]);
  const [includeMe, setIncludeMe] = useState(true);

  const totalNum = Number(total) || 0;
  const peopleCount = picked.length + (includeMe ? 1 : 0);
  const perHead = useMemo(() => (peopleCount > 0 ? Math.ceil(totalNum / peopleCount) : 0), [totalNum, peopleCount]);

  const toggle = (id: string) => {
    playClick(); vibrate(10);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const sendRequests = () => {
    playClick(); vibrate(15);
    setStep("processing");
    setTimeout(() => {
      // Simulate friends paying you back
      picked.forEach((id, i) => {
        const f = FRIENDS.find((x) => x.id === id)!;
        setTimeout(() => actions.receiveMoney(f.name, perHead), 200 * (i + 1));
      });
      playSuccess(); vibrate([20, 60, 20]);
      setStep("success");
    }, 1600);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-card">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 active:scale-90">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Receipt className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Split Bill</h1>
            <p className="text-xs opacity-90 mt-1">Share expenses with friends</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28">
        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div key="ok" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-3xl shadow-card p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold">Requests Sent</h2>
              <p className="text-sm text-muted-foreground mt-1">{picked.length} friends · ₹{perHead} each</p>
              <p className="text-xs text-muted-foreground mt-2">{title} · ₹{totalNum} total</p>
              <button onClick={onBack} className="mt-6 w-full bg-primary text-primary-foreground rounded-2xl py-3 font-semibold active:scale-[0.98]">Done</button>
            </motion.div>
          ) : step === "processing" ? (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-3xl shadow-card p-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="mt-3 font-semibold">Sending requests…</p>
              <p className="text-xs text-muted-foreground">Notifying {picked.length} friend{picked.length !== 1 ? "s" : ""}</p>
            </motion.div>
          ) : step === "review" ? (
            <motion.div key="review" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 rounded-2xl p-5 border border-cyan-200/40">
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold mt-1">₹{totalNum}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                  <span>{peopleCount} people</span>
                  <span>₹{perHead} per head</span>
                </div>
              </div>
              <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
                {picked.map((id) => {
                  const f = FRIENDS.find((x) => x.id === id)!;
                  return (
                    <div key={id} className="p-3 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold ${f.color}`}>{f.name[0]}</div>
                      <div className="flex-1"><p className="text-sm font-medium">{f.name}</p><p className="text-[11px] text-muted-foreground">{f.upi}</p></div>
                      <p className="font-semibold text-sm">₹{perHead}</p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep("form")} className="bg-muted rounded-2xl py-3 font-semibold active:scale-[0.98]">Back</button>
                <button onClick={sendRequests} className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl py-3 font-semibold active:scale-[0.98] shadow-md">Send Requests</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-card rounded-2xl shadow-card p-4">
                <label className="text-xs text-muted-foreground">Bill title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full bg-transparent border-b border-border pb-2 outline-none font-medium" />
                <label className="text-xs text-muted-foreground mt-4 block">Total amount</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-muted-foreground">₹</span>
                  <input value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="0"
                    className="flex-1 bg-transparent border-b border-border pb-1 outline-none text-3xl font-bold" />
                </div>
              </div>

              <div className="bg-card rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-1.5"><Users className="h-4 w-4" /> Split with</p>
                  <span className="text-[11px] text-muted-foreground">{peopleCount} selected</span>
                </div>
                <button onClick={() => { playClick(); setIncludeMe((v) => !v); }}
                  className={`mt-3 w-full flex items-center gap-3 p-2 rounded-xl border ${includeMe ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">U</div>
                  <div className="flex-1 text-left"><p className="text-sm font-medium">You</p><p className="text-[11px] text-muted-foreground">Include yourself</p></div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${includeMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {includeMe ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </div>
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {FRIENDS.map((f) => {
                    const sel = picked.includes(f.id);
                    return (
                      <button key={f.id} onClick={() => toggle(f.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border ${sel ? "border-primary bg-primary/5" : "border-border"}`}>
                        <div className={`h-8 w-8 rounded-full text-white font-bold flex items-center justify-center ${f.color}`}>{f.name[0]}</div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-medium truncate">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{f.upi}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 rounded-2xl p-4 border border-cyan-200/40">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Per head</span>
                  <span className="text-2xl font-bold">₹{perHead}</span>
                </div>
              </div>

              <button disabled={totalNum <= 0 || picked.length === 0}
                onClick={() => { playClick(); vibrate(15); setStep("review"); }}
                className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl py-3.5 font-semibold active:scale-[0.98] shadow-md disabled:opacity-50">
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}