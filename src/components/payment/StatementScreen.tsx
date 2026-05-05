import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Filter, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { toast } from "sonner";

const TRANSACTIONS = [
  { id: 1, type: "debit", name: "Sent to Rahim", amount: 500, category: "Transfer", date: "Today, 10:30 am", status: "success" },
  { id: 2, type: "credit", name: "Received from Anas", amount: 1200, category: "Transfer", date: "Today, 09:15 am", status: "success" },
  { id: 3, type: "debit", name: "Electricity Bill", amount: 850, category: "Bills", date: "Yesterday, 03:45 pm", status: "success" },
  { id: 4, type: "debit", name: "Airtel Recharge", amount: 299, category: "Recharge", date: "Yesterday, 11:20 am", status: "success" },
  { id: 5, type: "debit", name: "UPI to Zomato", amount: 420, category: "Food", date: "28 Apr, 08:30 pm", status: "success" },
  { id: 6, type: "credit", name: "Received from Fasil", amount: 2000, category: "Transfer", date: "27 Apr, 02:15 pm", status: "success" },
  { id: 7, type: "debit", name: "DTH Recharge", amount: 350, category: "Recharge", date: "26 Apr, 06:45 pm", status: "success" },
  { id: 8, type: "debit", name: "Water Bill", amount: 180, category: "Bills", date: "25 Apr, 10:30 am", status: "success" },
];

export function StatementScreen({ onBack }: { onBack: () => void }) {
  const [selectedAccount, setSelectedAccount] = useState("HDFC Bank - XX1234");
  const [filter, setFilter] = useState("all");

  const handleDownload = () => {
    playClick();
    vibrate(15);
    playSuccess();
    toast.success("Statement downloaded successfully!");
  };

  const filteredTransactions = TRANSACTIONS.filter((txn) => {
    if (filter === "all") return true;
    return txn.type === filter;
  });

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center mb-3">
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Mini Statement</h1>
        </div>

        {/* Account Selector */}
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm outline-none"
        >
          <option>HDFC Bank - XX1234</option>
          <option>SBI Bank - XX5678</option>
          <option>ICICI Bank - XX9012</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {[
            { id: "all", label: "All" },
            { id: "credit", label: "Credit" },
            { id: "debit", label: "Debit" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                vibrate(10);
                setFilter(tab.id);
              }}
              className={`flex-1 h-9 rounded-xl text-sm font-semibold transition ${
                filter === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400">{filteredTransactions.length} transactions</p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs text-blue-400 font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>

        <div className="space-y-2">
          {filteredTransactions.map((txn, index) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    txn.type === "credit"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {txn.type === "credit" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{txn.name}</p>
                  <p className="text-xs text-slate-400">{txn.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${
                      txn.type === "credit" ? "text-emerald-400" : "text-slate-100"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                  </p>
                  <p className="text-xs text-slate-400">{txn.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
