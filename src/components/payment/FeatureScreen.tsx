import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Share2, CheckCircle2, Loader2, Copy, Plus, Sparkles, TrendingUp, Bell, Tag, Gift, ArrowLeftRight, MapPin, Film, CalendarDays, BadgePercent, HeartHandshake, RefreshCw, ShieldPlus, Ticket, Receipt, WifiOff, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { toast } from "sonner";
import { playClick, playSuccess, vibrate, useStore } from "@/lib/payment-store";
import type { MoreOptionId } from "./MoreOptionsSheet";

function Header({ title, subtitle, onBack, accent = "from-blue-600 to-indigo-700" }: { title: string; subtitle?: string; onBack: () => void; accent?: string }) {
  return (
    <div className={`bg-gradient-to-br ${accent} text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-card`}>
      <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3 active:scale-90 transition-transform" aria-label="Back">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card rounded-2xl shadow-card p-4 ${className}`}>{children}</div>;
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={() => { if (disabled) return; playClick(); vibrate(15); onClick(); }} disabled={disabled} className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50">
      {children}
    </button>
  );
}

function fakeProcess<T>(value: T, ms = 1500): Promise<T> { return new Promise((r) => setTimeout(() => r(value), ms)); }

function RequestMoneyBody() {
  const [upi, setUpi] = useState(""); const [amt, setAmt] = useState(""); const [note, setNote] = useState(""); const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!upi.includes("@") || !amt) return toast.error("Enter UPI ID and amount");
    await fakeProcess(null, 1200); setSent(true); playSuccess(); vibrate([40, 30, 60]); toast.success(`Request for ₹${amt} sent`);
  };
  if (sent) return <Card className="text-center"><CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-2" /><p className="font-bold text-lg">Request sent</p><p className="text-sm text-muted-foreground">{upi} will be notified to pay ₹{amt}</p></Card>;
  return (
    <Card>
      <label className="text-xs text-muted-foreground">Receiver UPI ID</label>
      <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@okbank" className="w-full mt-1 mb-3 px-3 py-2.5 bg-muted rounded-xl outline-none focus:ring-2 ring-primary" />
      <label className="text-xs text-muted-foreground">Amount (₹)</label>
      <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="0" className="w-full mt-1 mb-3 px-3 py-3 bg-muted rounded-xl text-2xl font-bold outline-none focus:ring-2 ring-primary" />
      <label className="text-xs text-muted-foreground">Note (optional)</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lunch split, rent..." className="w-full mt-1 mb-4 px-3 py-2.5 bg-muted rounded-xl outline-none focus:ring-2 ring-primary" />
      <PrimaryBtn onClick={submit}>Send Request</PrimaryBtn>
    </Card>
  );
}

function BankTransferBody() {
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [acc, setAcc] = useState(""); const [ifsc, setIfsc] = useState(""); const [name, setName] = useState(""); const [amt, setAmt] = useState("");
  const [txnId] = useState(() => "NEFT" + Math.random().toString(36).slice(2, 10).toUpperCase());
  const submit = async () => {
    if (!acc || !ifsc || !name || !amt) return toast.error("Fill all fields");
    setStep("processing"); await fakeProcess(null, 2000); setStep("done"); playSuccess(); vibrate([50, 30, 80]);
  };
  if (step === "processing") return <Card className="text-center py-8"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" /><p className="font-semibold">Connecting to bank…</p><p className="text-xs text-muted-foreground mt-1">IMPS / NEFT secure channel</p></Card>;
  if (step === "done") return <Card className="text-center"><CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-2" /><p className="font-bold text-lg">Transfer successful</p><p className="text-sm">₹{amt} sent to {name}</p><p className="text-[11px] text-muted-foreground mt-2">Ref: {txnId}</p></Card>;
  return (
    <Card className="space-y-3">
      <div><label className="text-xs text-muted-foreground">Beneficiary name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div><label className="text-xs text-muted-foreground">Account number</label><input value={acc} onChange={(e) => setAcc(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div><label className="text-xs text-muted-foreground">IFSC code</label><input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div><label className="text-xs text-muted-foreground">Amount (₹)</label><input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-full mt-1 px-3 py-3 bg-muted rounded-xl text-2xl font-bold outline-none" /></div>
      <PrimaryBtn onClick={submit}>Transfer ₹{amt || "0"}</PrimaryBtn>
    </Card>
  );
}

function SelfTransferBody() {
  const balance = useStore((s) => s.balance);
  const [from, setFrom] = useState("HDFC ••1234"); const [to, setTo] = useState("SBI ••8821"); const [amt, setAmt] = useState(""); const [done, setDone] = useState(false);
  const submit = async () => { if (!amt) return toast.error("Enter amount"); await fakeProcess(null, 1400); setDone(true); playSuccess(); vibrate(40); };
  if (done) return <Card className="text-center"><CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" /><p className="font-bold">₹{amt} moved</p><p className="text-xs text-muted-foreground">{from} → {to}</p></Card>;
  return (
    <Card className="space-y-3">
      <p className="text-xs text-muted-foreground">Available: ₹{balance.toLocaleString("en-IN")}</p>
      <div><label className="text-xs text-muted-foreground">From</label><select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none"><option>HDFC ••1234</option><option>SBI ••8821</option><option>ICICI ••5520</option></select></div>
      <div><label className="text-xs text-muted-foreground">To</label><select value={to} onChange={(e) => setTo(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none"><option>SBI ••8821</option><option>HDFC ••1234</option><option>ICICI ••5520</option></select></div>
      <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="0" className="w-full px-3 py-3 bg-muted rounded-xl text-2xl font-bold outline-none" />
      <PrimaryBtn onClick={submit}>Move ₹{amt || "0"}</PrimaryBtn>
    </Card>
  );
}

function ApproveBody() {
  const [reqs, setReqs] = useState([
    { id: "1", from: "Rahim Khan", upi: "rahim@okbank", amt: 350, note: "Dinner" },
    { id: "2", from: "Priya Menon", upi: "priya@okbank", amt: 1200, note: "Trip share" },
    { id: "3", from: "Cafe Bistro", upi: "cafe@okbank", amt: 480, note: "Order #2298" },
  ]);
  const act = (id: string, ok: boolean) => { setReqs((r) => r.filter((x) => x.id !== id)); playClick(); vibrate(20); toast(ok ? "Approved & paid" : "Declined"); };
  if (!reqs.length) return <Card className="text-center"><Sparkles className="h-10 w-10 text-primary mx-auto mb-2" /><p className="font-bold">No pending requests</p></Card>;
  return <div className="space-y-3">{reqs.map((r) => (
    <Card key={r.id}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{r.from[0]}</div>
        <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{r.from}</p><p className="text-xs text-muted-foreground truncate">{r.upi} · {r.note}</p></div>
        <p className="font-bold">₹{r.amt}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => act(r.id, false)} className="py-2 rounded-xl bg-muted text-sm font-semibold active:scale-95">Decline</button>
        <button onClick={() => act(r.id, true)} className="py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold active:scale-95">Pay ₹{r.amt}</button>
      </div>
    </Card>
  ))}</div>;
}

function IntlBody() {
  const RATES: Record<string, number> = { USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SGD: 0.016 };
  const [cur, setCur] = useState("USD"); const [inr, setInr] = useState("10000");
  const out = (parseFloat(inr || "0") * RATES[cur]).toFixed(2);
  return (
    <Card className="space-y-3">
      <p className="text-xs text-muted-foreground">Live indicative rates · Settlement T+1</p>
      <div className="flex gap-2">
        <input value={inr} onChange={(e) => setInr(e.target.value.replace(/\D/g, ""))} className="flex-1 px-3 py-3 bg-muted rounded-xl text-xl font-bold outline-none" />
        <select value={cur} onChange={(e) => setCur(e.target.value)} className="px-3 bg-muted rounded-xl outline-none">{Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="bg-muted rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Receiver gets</p><p className="text-2xl font-bold">{out} {cur}</p></div>
      <PrimaryBtn onClick={() => toast.success(`SWIFT transfer initiated: ${out} ${cur}`)}>Send Internationally</PrimaryBtn>
    </Card>
  );
}

function ReceiptBody() {
  const txns = useStore((s) => s.txns); const list = txns.slice(0, 8);
  if (!list.length) return <Card className="text-center"><Receipt className="h-10 w-10 text-primary mx-auto mb-2" /><p className="font-bold">No transactions yet</p><p className="text-xs text-muted-foreground">Make a payment to download a receipt.</p></Card>;
  const dl = (t: typeof list[number]) => {
    const text = `PAYMENT RECEIPT\n----------------\nTo: ${t.name}\nUPI: ${t.upi}\nAmount: Rs.${t.amount}\nDate: ${new Date(t.ts).toLocaleString()}\nTxn ID: ${t.id}\nStatus: SUCCESS\n`;
    const blob = new Blob([text], { type: "text/plain" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `receipt-${t.id}.txt`; a.click(); URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };
  return <div className="space-y-2">{list.map((t) => (
    <Card key={t.id} className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">{t.name[0]}</div>
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{t.name}</p><p className="text-[11px] text-muted-foreground">{new Date(t.ts).toLocaleDateString()}</p></div>
      <p className="font-bold text-sm">₹{t.amount}</p>
      <button onClick={() => dl(t)} className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90"><Download className="h-4 w-4" /></button>
    </Card>
  ))}</div>;
}

function AnalyticsBody() {
  const txns = useStore((s) => s.txns);
  const total = txns.reduce((n, t) => n + (t.type === "sent" ? t.amount : 0), 0);
  const recv = txns.reduce((n, t) => n + (t.type === "received" ? t.amount : 0), 0);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const sum = txns.filter((t) => new Date(t.ts).toDateString() === d.toDateString() && t.type === "sent").reduce((n, t) => n + t.amount, 0);
    return { label: d.toLocaleDateString(undefined, { weekday: "short" }), v: sum };
  });
  const max = Math.max(...days.map((d) => d.v), 1);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-[11px] text-muted-foreground">Sent</p><p className="text-xl font-bold text-rose-500">₹{total}</p></Card>
        <Card><p className="text-[11px] text-muted-foreground">Received</p><p className="text-xl font-bold text-emerald-500">₹{recv}</p></Card>
      </div>
      <Card>
        <p className="text-sm font-semibold mb-3">Last 7 days</p>
        <div className="flex items-end gap-2 h-32">{days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-primary/20 rounded-t-lg flex items-end" style={{ height: "100%" }}>
              <div className="w-full gradient-primary rounded-t-lg transition-all" style={{ height: `${(d.v / max) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}</div>
      </Card>
    </div>
  );
}

function SpendingBody() {
  const cats = [
    { n: "Food & Drinks", v: 4250, c: "bg-orange-500" },
    { n: "Transport", v: 2100, c: "bg-blue-500" },
    { n: "Shopping", v: 6800, c: "bg-purple-500" },
    { n: "Bills", v: 3200, c: "bg-emerald-500" },
    { n: "Entertainment", v: 1450, c: "bg-pink-500" },
  ];
  const total = cats.reduce((n, c) => n + c.v, 0);
  return (
    <Card className="space-y-3">
      <div className="text-center mb-2"><p className="text-xs text-muted-foreground">Total this month</p><p className="text-3xl font-bold">₹{total.toLocaleString("en-IN")}</p></div>
      {cats.map((c) => (
        <div key={c.n}>
          <div className="flex justify-between text-sm mb-1"><span>{c.n}</span><span className="font-semibold">₹{c.v}</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${c.c}`} style={{ width: `${(c.v / total) * 100}%` }} /></div>
        </div>
      ))}
    </Card>
  );
}

function StatementBody() {
  const [month, setMonth] = useState("November 2025");
  return (
    <Card className="space-y-3">
      <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2.5 bg-muted rounded-xl outline-none">
        {["November 2025", "October 2025", "September 2025"].map((m) => <option key={m}>{m}</option>)}
      </select>
      <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Opening balance</span><span>₹28,140</span></div>
        <div className="flex justify-between"><span>Total credits</span><span className="text-emerald-500">+ ₹12,400</span></div>
        <div className="flex justify-between"><span>Total debits</span><span className="text-rose-500">- ₹14,700</span></div>
        <div className="flex justify-between font-bold border-t border-border pt-1 mt-1"><span>Closing balance</span><span>₹25,840</span></div>
      </div>
      <PrimaryBtn onClick={() => toast.success(`${month} statement downloaded`)}>Download PDF</PrimaryBtn>
    </Card>
  );
}

function AddBankBody() {
  const [step, setStep] = useState<"pick" | "verify" | "done">("pick");
  const [bank, setBank] = useState<string | null>(null);
  const banks = ["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank"];
  useEffect(() => { if (step === "verify") { const t = setTimeout(() => setStep("done"), 1800); return () => clearTimeout(t); } }, [step]);
  if (step === "done") return <Card className="text-center"><CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" /><p className="font-bold">{bank} linked</p><p className="text-xs text-muted-foreground">A/c ••{Math.floor(1000 + Math.random() * 9000)} verified</p></Card>;
  if (step === "verify") return <Card className="text-center py-6"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" /><p className="font-semibold">Fetching {bank} account…</p><p className="text-xs text-muted-foreground">Verifying via SMS</p></Card>;
  return <div className="space-y-2">{banks.map((b) => (
    <button key={b} onClick={() => { setBank(b); setStep("verify"); playClick(); vibrate(15); }} className="w-full text-left">
      <Card className="flex items-center gap-3 active:scale-[0.99] transition-transform">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">{b[0]}</div>
        <p className="flex-1 font-semibold text-sm">{b}</p>
        <Plus className="h-4 w-4 text-muted-foreground" />
      </Card>
    </button>
  ))}</div>;
}

function CardsBody() {
  const [cards, setCards] = useState([
    { id: "1", name: "HDFC Debit", num: "5412 •••• •••• 1234", color: "from-blue-600 to-indigo-700", frozen: false },
    { id: "2", name: "ICICI Credit", num: "4716 •••• •••• 5520", color: "from-rose-600 to-pink-700", frozen: false },
  ]);
  const toggle = (id: string) => { setCards((cs) => cs.map((c) => c.id === id ? { ...c, frozen: !c.frozen } : c)); playClick(); vibrate(15); toast("Card updated"); };
  return <div className="space-y-3">{cards.map((c) => (
    <div key={c.id} className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-5 shadow-card relative ${c.frozen ? "opacity-60" : ""}`}>
      <p className="text-xs opacity-80">{c.name}</p>
      <p className="text-lg font-mono mt-3 tracking-widest">{c.num}</p>
      <div className="flex items-end justify-between mt-4"><div><p className="text-[9px] opacity-70">VALID</p><p className="text-sm">12/28</p></div>
        <button onClick={() => toggle(c.id)} className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-xs font-semibold">{c.frozen ? "Unfreeze" : "Freeze"}</button>
      </div>
    </div>
  ))}</div>;
}

function AccountBody() {
  return (
    <Card className="space-y-3">
      {[["Name", "User"], ["UPI ID", "user@okbank"], ["Phone", "+91 9876543210"], ["Bank", "HDFC ••1234"], ["KYC", "Verified ✔"], ["Member since", "Jan 2024"]].map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm py-1 border-b border-border last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
      ))}
    </Card>
  );
}

function OffersBody() {
  const offers = [
    { t: "10% off Mobile Recharge", c: "Up to ₹50 cashback · Use code RECHARGE10" },
    { t: "Flat ₹100 on Electricity Bill", c: "Min bill ₹500 · Limited time" },
    { t: "Buy 1 Get 1 Movie Ticket", c: "Wed only · BMS partner" },
    { t: "5% Cashback on Gold", c: "Min ₹1,000 · Sovereign gold" },
  ];
  return <div className="space-y-3">{offers.map((o, i) => (
    <Card key={i} className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center"><Tag className="h-6 w-6" /></div>
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{o.t}</p><p className="text-[11px] text-muted-foreground">{o.c}</p></div>
      <button onClick={() => { playClick(); toast.success("Offer applied"); }} className="text-xs font-bold text-primary">Apply</button>
    </Card>
  ))}</div>;
}

function InviteBody({ refer }: { refer?: boolean }) {
  const code = "USER2026"; const link = `https://gpay-clone.app/invite/${code}`;
  return (
    <Card className="space-y-4 text-center">
      <Gift className="h-12 w-12 text-primary mx-auto" />
      <div><p className="font-bold text-lg">{refer ? "Refer & earn ₹100" : "Invite a friend"}</p><p className="text-xs text-muted-foreground">Both you and your friend get ₹100 cashback when they make their first payment.</p></div>
      <div className="bg-muted rounded-xl p-3 flex items-center justify-between">
        <span className="font-mono font-bold tracking-wider">{code}</span>
        <button onClick={() => { navigator.clipboard?.writeText(code); toast.success("Code copied"); }} className="text-primary"><Copy className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { navigator.clipboard?.writeText(link); toast.success("Link copied"); }} className="py-2.5 rounded-xl bg-muted text-sm font-semibold">Copy link</button>
        <button onClick={() => { if (navigator.share) navigator.share({ url: link, text: "Join me on GPay" }).catch(() => {}); else toast("Share not available"); }} className="py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Share</button>
      </div>
    </Card>
  );
}

function VoucherBody() {
  const v = [
    { b: "Amazon", a: 500, c: "from-amber-500 to-orange-600" },
    { b: "Flipkart", a: 250, c: "from-blue-500 to-indigo-600" },
    { b: "Swiggy", a: 100, c: "from-rose-500 to-orange-500" },
    { b: "BookMyShow", a: 200, c: "from-rose-600 to-pink-700" },
  ];
  return <div className="grid grid-cols-2 gap-3">{v.map((x, i) => (
    <div key={i} className={`bg-gradient-to-br ${x.c} text-white rounded-2xl p-4 shadow-card`}>
      <Ticket className="h-5 w-5 mb-2 opacity-80" />
      <p className="text-xs opacity-90">{x.b}</p>
      <p className="text-2xl font-bold">₹{x.a}</p>
      <button onClick={() => { playClick(); toast.success(`${x.b} voucher copied`); }} className="text-[10px] font-bold mt-2 underline">REDEEM</button>
    </div>
  ))}</div>;
}

function UpiLiteBody() {
  const [bal, setBal] = useState(200); const [add, setAdd] = useState("");
  return (
    <Card className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center">
        <p className="text-xs opacity-90">UPI Lite balance</p><p className="text-4xl font-bold mt-1">₹{bal}</p><p className="text-[10px] opacity-80 mt-1">No PIN needed below ₹500</p>
      </div>
      <div className="flex gap-2">
        <input value={add} onChange={(e) => setAdd(e.target.value.replace(/\D/g, ""))} placeholder="Add money" className="flex-1 px-3 py-2.5 bg-muted rounded-xl outline-none" />
        <button onClick={() => { const n = parseInt(add || "0"); if (!n) return; setBal((b) => Math.min(2000, b + n)); setAdd(""); toast.success(`₹${n} added`); }} className="px-4 rounded-xl gradient-primary text-primary-foreground font-semibold">Add</button>
      </div>
    </Card>
  );
}

function AutoPayBody() {
  const [list, setList] = useState([
    { id: "1", n: "Netflix", a: 649, d: 5, on: true },
    { id: "2", n: "Electricity", a: 1200, d: 12, on: true },
    { id: "3", n: "Gym", a: 999, d: 1, on: false },
  ]);
  return <div className="space-y-2">{list.map((x) => (
    <Card key={x.id} className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><RefreshCw className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{x.n}</p><p className="text-[11px] text-muted-foreground">₹{x.a} · {x.d}th of every month</p></div>
      <button onClick={() => { setList((l) => l.map((i) => i.id === x.id ? { ...i, on: !i.on } : i)); vibrate(15); }} className={`h-6 w-11 rounded-full transition-colors relative ${x.on ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
        <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${x.on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </Card>
  ))}</div>;
}

function InsuranceBody() {
  const plans = [
    { n: "Health Cover ₹5L", p: 499, t: "Family floater" },
    { n: "Term Life ₹1Cr", p: 899, t: "Pure protection" },
    { n: "Bike Insurance", p: 1299, t: "Annual · zero dep" },
    { n: "Travel Insurance", p: 199, t: "Per trip · global" },
  ];
  return <div className="space-y-2">{plans.map((p, i) => (
    <Card key={i} className="flex items-center gap-3">
      <ShieldPlus className="h-8 w-8 text-primary" />
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{p.n}</p><p className="text-[11px] text-muted-foreground">{p.t}</p></div>
      <div className="text-right"><p className="text-xs text-muted-foreground">From</p><p className="font-bold">₹{p.p}/mo</p></div>
      <button onClick={() => toast.success("Quote requested")} className="text-xs font-bold text-primary">BUY</button>
    </Card>
  ))}</div>;
}

function GoldBody() {
  const RATE = 7240; const [inr, setInr] = useState("1000");
  const grams = (parseFloat(inr || "0") / RATE).toFixed(4);
  return (
    <Card className="space-y-3">
      <div className="bg-gradient-to-br from-amber-400 to-yellow-600 text-white rounded-2xl p-5">
        <p className="text-xs opacity-90">Live 24K gold rate</p><p className="text-3xl font-bold">₹{RATE}<span className="text-sm font-medium opacity-90">/g</span></p>
      </div>
      <input value={inr} onChange={(e) => setInr(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-3 bg-muted rounded-xl text-2xl font-bold outline-none" />
      <div className="bg-muted rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">You get</p><p className="text-xl font-bold">{grams} g</p></div>
      <PrimaryBtn onClick={() => toast.success(`Bought ${grams}g gold`)}>Buy Gold</PrimaryBtn>
    </Card>
  );
}

function MutualFundsBody() {
  const f = [
    { n: "Axis Bluechip Fund", r: "+18.4%", c: "text-emerald-500" },
    { n: "Mirae Asset Large Cap", r: "+14.2%", c: "text-emerald-500" },
    { n: "Parag Parikh Flexi", r: "+22.1%", c: "text-emerald-500" },
    { n: "ICICI Pru Tech", r: "-3.7%", c: "text-rose-500" },
  ];
  return <div className="space-y-2">{f.map((x, i) => (
    <Card key={i} className="flex items-center gap-3">
      <TrendingUp className="h-7 w-7 text-primary" />
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{x.n}</p><p className="text-[11px] text-muted-foreground">3Y returns</p></div>
      <p className={`font-bold ${x.c}`}>{x.r}</p>
      <button onClick={() => toast.success("SIP started")} className="text-xs font-bold text-primary">SIP</button>
    </Card>
  ))}</div>;
}

function CreditScoreBody() {
  const score = 782; const pct = ((score - 300) / 600) * 100;
  return (
    <Card className="text-center space-y-3">
      <p className="text-xs text-muted-foreground">Your CIBIL score</p>
      <p className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">{score}</p>
      <p className="text-emerald-500 font-semibold text-sm">Excellent</p>
      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" style={{ width: `${pct}%` }} /></div>
      <div className="grid grid-cols-3 gap-2 text-xs pt-2">
        <div><p className="text-muted-foreground">On-time</p><p className="font-bold">98%</p></div>
        <div><p className="text-muted-foreground">Utilisation</p><p className="font-bold">22%</p></div>
        <div><p className="text-muted-foreground">Accounts</p><p className="font-bold">5</p></div>
      </div>
    </Card>
  );
}

function LoanBody() {
  const offers = [
    { n: "Personal Loan", a: "₹5L", r: "10.5% p.a", t: "Pre-approved" },
    { n: "Home Loan", a: "₹50L", r: "8.4% p.a", t: "20 yr tenure" },
    { n: "Car Loan", a: "₹12L", r: "9.1% p.a", t: "Quick approval" },
  ];
  return <div className="space-y-2">{offers.map((o, i) => (
    <Card key={i}>
      <div className="flex items-center gap-3 mb-2"><BadgePercent className="h-7 w-7 text-primary" /><div className="flex-1"><p className="font-semibold text-sm">{o.n}</p><p className="text-[11px] text-muted-foreground">{o.t}</p></div></div>
      <div className="flex items-end justify-between"><p className="text-2xl font-bold">{o.a}</p><p className="text-sm text-muted-foreground">{o.r}</p></div>
      <button onClick={() => toast.success(`${o.n} application started`)} className="w-full mt-3 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Apply Now</button>
    </Card>
  ))}</div>;
}

function DonationsBody() {
  const c = [
    { n: "Akshaya Patra", t: "Feed a child for ₹50" },
    { n: "GiveIndia", t: "Verified NGOs · 80G" },
    { n: "CRY", t: "Child rights & you" },
    { n: "PM CARES", t: "National relief" },
  ];
  return <div className="space-y-2">{c.map((x, i) => (
    <Card key={i} className="flex items-center gap-3">
      <HeartHandshake className="h-7 w-7 text-rose-500" />
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{x.n}</p><p className="text-[11px] text-muted-foreground">{x.t}</p></div>
      <button onClick={() => toast.success(`Thanks! ₹100 donated to ${x.n}`)} className="text-xs font-bold text-primary">DONATE</button>
    </Card>
  ))}</div>;
}

function TravelBody() {
  const tabs = ["Flights", "Trains", "Buses", "Hotels"]; const [t, setT] = useState(0);
  return (
    <Card className="space-y-3">
      <div className="flex bg-muted rounded-xl p-1">{tabs.map((x, i) => (
        <button key={i} onClick={() => setT(i)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${t === i ? "bg-card shadow" : ""}`}>{x}</button>
      ))}</div>
      <input placeholder="From" className="w-full px-3 py-2.5 bg-muted rounded-xl outline-none" />
      <input placeholder="To" className="w-full px-3 py-2.5 bg-muted rounded-xl outline-none" />
      <input type="date" className="w-full px-3 py-2.5 bg-muted rounded-xl outline-none" />
      <PrimaryBtn onClick={() => toast.success(`Searching ${tabs[t]}…`)}>Search {tabs[t]}</PrimaryBtn>
    </Card>
  );
}

function MoviesBody() {
  const movies = [
    { n: "Dune: Part Three", t: "Sci-Fi · 2h 45m", r: "8.4" },
    { n: "Pushpa 3", t: "Action · 2h 50m", r: "7.9" },
    { n: "Avatar 3", t: "Adventure · 3h 10m", r: "8.7" },
  ];
  return <div className="space-y-2">{movies.map((m, i) => (
    <Card key={i} className="flex items-center gap-3">
      <div className="h-14 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white"><Film className="h-5 w-5" /></div>
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{m.n}</p><p className="text-[11px] text-muted-foreground">{m.t}</p><p className="text-[11px]">⭐ {m.r}</p></div>
      <button onClick={() => toast.success("Tickets booked")} className="text-xs font-bold text-primary px-3 py-1.5 bg-primary/10 rounded-lg">BOOK</button>
    </Card>
  ))}</div>;
}

function EventsBody() {
  const ev = [
    { n: "Coldplay India Tour", d: "21 Jan · Mumbai" },
    { n: "Comicon 2026", d: "5 Feb · Bangalore" },
    { n: "Sunburn Goa", d: "28 Dec · Vagator" },
  ];
  return <div className="space-y-2">{ev.map((x, i) => (
    <Card key={i} className="flex items-center gap-3">
      <CalendarDays className="h-8 w-8 text-primary" />
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{x.n}</p><p className="text-[11px] text-muted-foreground">{x.d}</p></div>
      <button onClick={() => toast.success("Going!")} className="text-xs font-bold text-primary">RSVP</button>
    </Card>
  ))}</div>;
}

function EmiBody() {
  const [p, setP] = useState("500000"); const [r, setR] = useState("9.5"); const [n, setN] = useState("36");
  const emi = useMemo(() => {
    const P = parseFloat(p || "0"), R = parseFloat(r || "0") / 12 / 100, N = parseFloat(n || "0");
    if (!P || !R || !N) return 0;
    return Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
  }, [p, r, n]);
  return (
    <Card className="space-y-3">
      <div><label className="text-xs text-muted-foreground">Loan amount (₹)</label><input value={p} onChange={(e) => setP(e.target.value.replace(/\D/g, ""))} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div><label className="text-xs text-muted-foreground">Interest rate (% p.a)</label><input value={r} onChange={(e) => setR(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div><label className="text-xs text-muted-foreground">Tenure (months)</label><input value={n} onChange={(e) => setN(e.target.value.replace(/\D/g, ""))} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 text-center"><p className="text-xs opacity-90">Monthly EMI</p><p className="text-3xl font-bold">₹{emi.toLocaleString("en-IN")}</p></div>
    </Card>
  );
}

function CurrencyBody() {
  const RATES: Record<string, number> = { USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.82, AED: 0.044, SGD: 0.016, AUD: 0.018 };
  const [from, setFrom] = useState("INR"); const [to, setTo] = useState("USD"); const [amt, setAmt] = useState("1000");
  const result = useMemo(() => {
    const a = parseFloat(amt || "0");
    const inr = from === "INR" ? a : a / RATES[from];
    return to === "INR" ? inr : inr * RATES[to];
  }, [amt, from, to]);
  const opts = ["INR", ...Object.keys(RATES)];
  return (
    <Card className="space-y-3">
      <div className="flex gap-2"><input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} className="flex-1 px-3 py-3 bg-muted rounded-xl text-xl font-bold outline-none" />
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 bg-muted rounded-xl outline-none">{opts.map((c) => <option key={c}>{c}</option>)}</select></div>
      <button onClick={() => { const f = from; setFrom(to); setTo(f); }} className="mx-auto h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><ArrowLeftRight className="h-4 w-4" /></button>
      <div className="flex gap-2"><div className="flex-1 px-3 py-3 bg-muted rounded-xl text-xl font-bold">{result.toFixed(2)}</div>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="px-3 bg-muted rounded-xl outline-none">{opts.map((c) => <option key={c}>{c}</option>)}</select></div>
    </Card>
  );
}

function NearbyBody() {
  const stores = [
    { n: "Reliance Smart", d: "0.4 km · Grocery" },
    { n: "Cafe Coffee Day", d: "0.7 km · Cafe" },
    { n: "More Supermarket", d: "1.2 km · Grocery" },
    { n: "Apollo Pharmacy", d: "1.5 km · Pharmacy" },
  ];
  return <div className="space-y-2">{stores.map((s, i) => (
    <Card key={i} className="flex items-center gap-3">
      <MapPin className="h-7 w-7 text-rose-500" />
      <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{s.n}</p><p className="text-[11px] text-muted-foreground">{s.d}</p></div>
      <button onClick={() => toast("Opening directions")} className="text-xs font-bold text-primary">PAY</button>
    </Card>
  ))}</div>;
}

function OfflineBody() {
  const [on, setOn] = useState(false);
  return (
    <Card className="space-y-4 text-center">
      <WifiOff className="h-14 w-14 text-primary mx-auto" />
      <p className="font-bold text-lg">Offline UPI Payments</p>
      <p className="text-xs text-muted-foreground">Use *99# to pay via SMS even without internet. Up to ₹5,000 per day.</p>
      <button onClick={() => { setOn((x) => !x); vibrate(15); toast.success(!on ? "Offline mode active" : "Offline mode off"); }} className={`w-full py-3 rounded-xl font-semibold ${on ? "bg-emerald-500 text-white" : "gradient-primary text-primary-foreground"}`}>
        {on ? "Offline Mode: ON" : "Enable Offline Mode"}
      </button>
    </Card>
  );
}

function AboutBody() {
  return (
    <Card className="space-y-3 text-center">
      <div className="h-16 w-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center text-white text-2xl font-bold">G</div>
      <p className="font-bold text-lg">GPay Clone</p>
      <p className="text-xs text-muted-foreground">Version 2.4.1 · Build 20260430</p>
      <p className="text-xs text-muted-foreground">A demonstration payment app showcasing fintech UX patterns. Not a real financial service.</p>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button className="py-2 rounded-xl bg-muted text-xs font-semibold">Terms of Service</button>
        <button className="py-2 rounded-xl bg-muted text-xs font-semibold">Privacy Policy</button>
      </div>
    </Card>
  );
}

function HelpBody() {
  const faqs = [
    { q: "How do I add a bank account?", a: "Go to Add Bank, select your bank, and verify via SMS." },
    { q: "What if a payment fails?", a: "Money is auto-refunded within 3 working days." },
    { q: "How do I reset my UPI PIN?", a: "Open Change PIN and authenticate with your debit card." },
    { q: "Is my data secure?", a: "We use 256-bit encryption and NPCI-compliant infrastructure." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      <Card className="flex items-center gap-3"><Headphones className="h-8 w-8 text-primary" />
        <div className="flex-1"><p className="font-semibold text-sm">24×7 Support</p><p className="text-[11px] text-muted-foreground">Avg response: 2 min</p></div>
        <button onClick={() => toast.success("Connecting to agent…")} className="text-xs font-bold text-primary">CHAT</button>
      </Card>
      {faqs.map((f, i) => (
        <Card key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center">
            <span className="font-semibold text-sm">{f.q}</span><span className="text-muted-foreground">{open === i ? "−" : "+"}</span>
          </button>
          <AnimatePresence>{open === i && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-muted-foreground mt-2 overflow-hidden">{f.a}</motion.p>
          )}</AnimatePresence>
        </Card>
      ))}
    </div>
  );
}

function DarkModeBody() {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !dark; setDark(next);
    if (next) document.documentElement.classList.add("dark"); else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", next ? "dark" : "light");
    vibrate(15); toast.success(next ? "Dark mode on" : "Light mode on");
  };
  return (
    <Card className="space-y-4">
      <p className="text-sm text-muted-foreground">Toggle between light and dark themes across the app.</p>
      <button onClick={toggle} className={`w-full py-4 rounded-xl font-semibold ${dark ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-900"}`}>
        {dark ? "🌙 Dark Mode (On)" : "☀️ Light Mode (On)"}
      </button>
    </Card>
  );
}

function SettingsBody() {
  const items = [
    { n: "Notifications", v: "On", i: <Bell className="h-4 w-4" /> },
    { n: "Biometric login", v: "Enabled", i: <ShieldPlus className="h-4 w-4" /> },
    { n: "Auto-lock", v: "1 min", i: <RefreshCw className="h-4 w-4" /> },
    { n: "Sound effects", v: "On", i: <Sparkles className="h-4 w-4" /> },
    { n: "Vibration", v: "On", i: <Sparkles className="h-4 w-4" /> },
    { n: "Region", v: "India", i: <MapPin className="h-4 w-4" /> },
  ];
  return <Card className="space-y-1">{items.map((x) => (
    <div key={x.n} className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm flex items-center gap-2 text-muted-foreground">{x.i}{x.n}</span>
      <span className="text-xs font-semibold">{x.v}</span>
    </div>
  ))}</Card>;
}

function QrGenBody() {
  const [name, setName] = useState("User");
  const [upi, setUpi] = useState("user@okbank");
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [dataUrl, setDataUrl] = useState<string>("");
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("pa", upi); params.set("pn", name);
    if (amt) params.set("am", amt);
    if (note) params.set("tn", note);
    const payload = `upi://pay?${params.toString()}`;
    QRCode.toDataURL(payload, { width: 280, margin: 2 }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [name, upi, amt, note]);
  const dl = () => { if (!dataUrl) return; const a = document.createElement("a"); a.href = dataUrl; a.download = `qr-${upi}.png`; a.click(); toast.success("QR downloaded"); };
  const share = () => {
    if (!dataUrl) return;
    if (navigator.share) {
      fetch(dataUrl).then((r) => r.blob()).then((b) => navigator.share({ files: [new File([b], "qr.png", { type: "image/png" })], title: "My UPI QR" }).catch(() => {}));
    } else toast("Share not available");
  };
  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div><label className="text-xs text-muted-foreground">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
        <div><label className="text-xs text-muted-foreground">UPI ID</label><input value={upi} onChange={(e) => setUpi(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs text-muted-foreground">Amount (opt)</label><input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
          <div><label className="text-xs text-muted-foreground">Note (opt)</label><input value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl outline-none" /></div>
        </div>
      </Card>
      <Card className="text-center">
        {dataUrl ? <img src={dataUrl} alt="UPI QR" className="mx-auto rounded-xl bg-white p-2" /> : <div className="h-[280px] flex items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        <p className="font-bold mt-3">{name}</p>
        <p className="text-xs text-muted-foreground">{upi}{amt && ` · ₹${amt}`}</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={dl} className="py-2.5 rounded-xl bg-muted text-sm font-semibold flex items-center justify-center gap-1"><Download className="h-4 w-4" /> Download</button>
          <button onClick={share} className="py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </Card>
    </div>
  );
}

type Spec = { title: string; subtitle?: string; accent?: string; body: () => React.ReactElement };

const REGISTRY: Partial<Record<MoreOptionId, Spec>> = {
  request:        { title: "Request Money", subtitle: "Ask anyone to pay you instantly", accent: "from-emerald-500 to-teal-600", body: () => <RequestMoneyBody /> },
  "bank-transfer":{ title: "Bank Transfer", subtitle: "IMPS · NEFT · RTGS", accent: "from-teal-600 to-cyan-700", body: () => <BankTransferBody /> },
  self:           { title: "Self Transfer", subtitle: "Move money between your accounts", accent: "from-indigo-500 to-blue-700", body: () => <SelfTransferBody /> },
  approve:        { title: "Approve to Pay", subtitle: "Review pending payment requests", accent: "from-amber-500 to-orange-600", body: () => <ApproveBody /> },
  intl:           { title: "International Transfer", subtitle: "Send money abroad · SWIFT", accent: "from-violet-500 to-purple-700", body: () => <IntlBody /> },

  receipt:        { title: "Download Receipt", subtitle: "Tap any transaction to download", accent: "from-blue-600 to-indigo-700", body: () => <ReceiptBody /> },
  analytics:      { title: "Analytics", subtitle: "Your spending at a glance", accent: "from-purple-500 to-violet-700", body: () => <AnalyticsBody /> },
  spending:       { title: "Spending Summary", subtitle: "Where your money went", accent: "from-orange-500 to-red-600", body: () => <SpendingBody /> },
  statement:      { title: "Monthly Statement", subtitle: "Download as PDF", accent: "from-sky-500 to-blue-700", body: () => <StatementBody /> },

  "add-bank":     { title: "Add Bank Account", subtitle: "Link a new bank · 1 min setup", accent: "from-violet-500 to-purple-700", body: () => <AddBankBody /> },
  cards:          { title: "Manage Cards", subtitle: "Debit & credit cards", accent: "from-emerald-500 to-green-700", body: () => <CardsBody /> },
  account:        { title: "Account Details", subtitle: "Your profile & KYC", accent: "from-emerald-500 to-teal-700", body: () => <AccountBody /> },

  offers:         { title: "Offers", subtitle: "Cashback & coupons just for you", accent: "from-pink-500 to-rose-700", body: () => <OffersBody /> },
  refer:          { title: "Refer & Earn", subtitle: "Earn ₹100 for every friend", accent: "from-purple-500 to-violet-700", body: () => <InviteBody refer /> },
  invite:         { title: "Invite Friends", subtitle: "Share GPay with anyone", accent: "from-orange-500 to-amber-700", body: () => <InviteBody /> },
  offline:        { title: "Offline Pay", subtitle: "Pay even without internet", accent: "from-slate-600 to-slate-800", body: () => <OfflineBody /> },

  voucher:        { title: "Voucher Wallet", subtitle: "Brand vouchers ready to redeem", accent: "from-blue-600 to-indigo-700", body: () => <VoucherBody /> },
  "upi-lite":     { title: "UPI Lite", subtitle: "Instant low-value payments", accent: "from-emerald-500 to-green-700", body: () => <UpiLiteBody /> },
  autopay:        { title: "AutoPay", subtitle: "Manage recurring mandates", accent: "from-pink-500 to-rose-700", body: () => <AutoPayBody /> },
  insurance:      { title: "Insurance", subtitle: "Health · Life · Vehicle · Travel", accent: "from-violet-500 to-purple-700", body: () => <InsuranceBody /> },
  gold:           { title: "Gold & Silver", subtitle: "Buy 24K digital gold", accent: "from-amber-500 to-yellow-700", body: () => <GoldBody /> },
  "mutual-funds": { title: "Mutual Funds", subtitle: "Start a SIP in 60 seconds", accent: "from-emerald-500 to-teal-700", body: () => <MutualFundsBody /> },
  "credit-score": { title: "Credit Score", subtitle: "Free CIBIL · updated monthly", accent: "from-purple-500 to-pink-700", body: () => <CreditScoreBody /> },
  "loan-offers":  { title: "Loan Offers", subtitle: "Pre-approved at low rates", accent: "from-rose-500 to-red-700", body: () => <LoanBody /> },
  donations:      { title: "Donations", subtitle: "Verified NGOs · 80G receipt", accent: "from-pink-500 to-rose-700", body: () => <DonationsBody /> },

  travel:         { title: "Travel Bookings", subtitle: "Flights · Trains · Hotels", accent: "from-sky-500 to-blue-700", body: () => <TravelBody /> },
  movies:         { title: "Movie Tickets", subtitle: "Now showing near you", accent: "from-purple-500 to-violet-700", body: () => <MoviesBody /> },
  events:         { title: "Event Bookings", subtitle: "Concerts · Comedy · Sports", accent: "from-orange-500 to-amber-700", body: () => <EventsBody /> },
  emi:            { title: "EMI Calculator", subtitle: "Plan your loan repayment", accent: "from-emerald-500 to-green-700", body: () => <EmiBody /> },
  currency:       { title: "Currency Converter", subtitle: "Live forex rates", accent: "from-blue-600 to-cyan-700", body: () => <CurrencyBody /> },
  nearby:         { title: "Nearby Stores", subtitle: "Pay accepted at these places", accent: "from-pink-500 to-rose-700", body: () => <NearbyBody /> },

  settings:       { title: "Settings", subtitle: "App preferences", accent: "from-slate-600 to-slate-800", body: () => <SettingsBody /> },
  dark:           { title: "Dark Mode", subtitle: "Switch theme instantly", accent: "from-indigo-600 to-blue-800", body: () => <DarkModeBody /> },
  help:           { title: "Help & Support", subtitle: "We are here 24×7", accent: "from-emerald-500 to-teal-700", body: () => <HelpBody /> },
  about:          { title: "About Us", subtitle: "App information", accent: "from-violet-500 to-purple-800", body: () => <AboutBody /> },

  "upi-id":       { title: "My UPI QR", subtitle: "Generate & share your UPI QR", accent: "from-pink-500 to-purple-700", body: () => <QrGenBody /> },
};

export function FeatureScreen({ id, onBack }: { id: MoreOptionId; onBack: () => void }) {
  const spec = REGISTRY[id];
  if (!spec) {
    return (
      <div className="h-full flex flex-col bg-background">
        <Header title={prettyDefault(id)} subtitle="Secure · Instant · Verified" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-24"><QrGenBody /></div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col bg-background">
      <Header title={spec.title} subtitle={spec.subtitle} onBack={onBack} accent={spec.accent} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">{spec.body()}</div>
    </div>
  );
}

function prettyDefault(id: string) { return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
