import { useStore } from "@/lib/payment-store";
import { ArrowDownLeft, ArrowUpRight, Download, MessageSquare } from "lucide-react";
import { useState } from "react";

export function HistoryScreen() {
  const txns = useStore((s) => s.txns);
  const sms = useStore((s) => s.sms);
  const [tab, setTab] = useState<"txns" | "sms">("txns");

  const downloadReceipt = (t: typeof txns[0]) => {
    const content = `
========= PAYMENT RECEIPT =========
Transaction ID: ${t.id}
Date: ${new Date(t.ts).toLocaleString()}
Type: ${t.type === "sent" ? "DEBIT" : "CREDIT"}
Amount: ₹${t.amount}
${t.type === "sent" ? "To" : "From"}: ${t.name}
UPI: ${t.upi}
${t.note ? `Note: ${t.note}\n` : ""}Status: SUCCESS ✔
===================================
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${t.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="px-5 pt-12 pb-4 bg-card border-b border-border">
        <h2 className="text-2xl font-bold mb-3">History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("txns")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === "txns" ? "gradient-primary text-primary-foreground" : "bg-muted"}`}
          >
            Transactions
          </button>
          <button
            onClick={() => setTab("sms")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === "sms" ? "gradient-primary text-primary-foreground" : "bg-muted"}`}
          >
            <MessageSquare className="h-3 w-3 inline mr-1" /> SMS
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {tab === "txns" ? (
          txns.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No transactions yet</p>
          ) : (
            txns.map((t) => (
              <div key={t.id} className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === "received" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" : "bg-rose-100 text-rose-600 dark:bg-rose-950"}`}>
                  {t.type === "received" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.ts).toLocaleString()}</p>
                  {t.note && <p className="text-xs text-muted-foreground italic">"{t.note}"</p>}
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === "received" ? "text-emerald-600" : "text-foreground"}`}>
                    {t.type === "received" ? "+" : "-"}₹{t.amount}
                  </p>
                  <button onClick={() => downloadReceipt(t)} className="text-xs text-primary mt-1 active:scale-95">
                    <Download className="h-3 w-3 inline" /> Receipt
                  </button>
                </div>
              </div>
            ))
          )
        ) : sms.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">No messages yet</p>
        ) : (
          sms.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">HD</div>
                <p className="text-xs font-semibold">HDFC Bank</p>
                <p className="text-xs text-muted-foreground ml-auto">{new Date(m.ts).toLocaleTimeString()}</p>
              </div>
              <p className="text-sm">{m.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}