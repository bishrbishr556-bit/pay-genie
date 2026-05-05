import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, RefreshCw, Eye, EyeOff, Plus } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";

const ACCOUNTS = [
  { id: 1, bank: "HDFC Bank", number: "XX1234", balance: 25430.50, icon: "🏦", color: "from-blue-500 to-indigo-600" },
  { id: 2, bank: "SBI Bank", number: "XX5678", balance: 15240.00, icon: "🏦", color: "from-emerald-500 to-teal-600" },
  { id: 3, bank: "ICICI Bank", number: "XX9012", balance: 8750.25, icon: "🏦", color: "from-purple-500 to-fuchsia-600" },
];

export function BalanceScreen({ onBack }: { onBack: () => void }) {
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    playClick();
    vibrate(15);
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    playSuccess();
    vibrate([20, 30, 20]);
    setRefreshing(false);
  };

  const totalBalance = ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={() => {
              playClick();
              vibrate(15);
              onBack();
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-9">Account Balance</h1>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs opacity-80">Total Available Balance</p>
              <button
                onClick={() => {
                  playClick();
                  setHideBalance(!hideBalance);
                }}
                className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-90 transition"
              >
                {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <motion.p
              key={hideBalance ? "hidden" : "visible"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              {hideBalance ? "₹ ••••••" : `₹ ${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </motion.p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold active:scale-95 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Other Accounts */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold mb-3 px-1">Other Accounts</h3>
        <div className="space-y-3">
          {ACCOUNTS.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center text-2xl`}>
                  {account.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{account.bank}</p>
                  <p className="text-xs text-slate-400">A/c {account.number}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400">Available Balance</p>
                <p className="text-lg font-bold">
                  {hideBalance ? "₹ ••••••" : `₹ ${account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Account Button */}
      <div className="px-4 mt-6">
        <button
          onClick={() => {
            playClick();
            vibrate(15);
          }}
          className="w-full h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition"
        >
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>
    </div>
  );
}
