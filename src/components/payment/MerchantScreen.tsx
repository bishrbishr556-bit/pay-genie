import { useStore, actions, playClick } from "@/lib/payment-store";
import { ArrowLeft, QrCode } from "lucide-react";

export function MerchantScreen({ onBack }: { onBack: () => void }) {
  const txns = useStore((s) => s.txns);
  const today = new Date().toDateString();
  const todayTxns = txns.filter((t) => t.type === "received" && new Date(t.ts).toDateString() === today);
  const totalToday = todayTxns.reduce((a, b) => a + b.amount, 0);

  const simulateReceive = () => {
    playClick();
    const amounts = [100, 250, 500, 750, 1000];
    const names = ["Anas P", "Rahim K", "Priya", "Ravi"];
    actions.receiveMoney(names[Math.floor(Math.random() * names.length)], amounts[Math.floor(Math.random() * amounts.length)]);
  };

  return (
    <div className="h-full bg-slate-950 text-white overflow-y-auto pb-24">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-white/10">
        <button onClick={onBack}><ArrowLeft className="h-6 w-6" /></button>
        <h2 className="font-bold text-xl">Merchant Mode</h2>
      </div>

      <div className="px-5 mt-6 text-center">
        <p className="text-xs opacity-70">Today's earnings</p>
        <p className="text-5xl font-bold mt-1">₹{totalToday}</p>
        <p className="text-xs opacity-70 mt-1">{todayTxns.length} customers</p>
      </div>

      <div className="mx-5 mt-6 bg-white text-slate-900 rounded-2xl p-6 text-center">
        <div className="h-48 w-48 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
          <QrCode className="h-32 w-32 text-slate-900" />
        </div>
        <p className="font-bold mt-3">Scan to pay</p>
        <p className="text-xs text-slate-600">merchant@upi</p>
      </div>

      <div className="px-5 mt-4">
        <button
          onClick={simulateReceive}
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl active:scale-[0.98]"
        >
          🔊 Simulate payment received
        </button>
      </div>

      <div className="px-5 mt-6">
        <h3 className="text-sm font-semibold mb-3">Today's transactions</h3>
        {todayTxns.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-6">No payments today</p>
        ) : (
          <div className="space-y-2">
            {todayTxns.map((t) => (
              <div key={t.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs opacity-60">{new Date(t.ts).toLocaleTimeString()}</p>
                </div>
                <p className="font-bold text-emerald-400">+₹{t.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}