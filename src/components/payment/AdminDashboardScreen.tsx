import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Users, DollarSign, Gift, Settings, 
  TrendingUp, Activity, Shield, Eye, Search,
  CheckCircle, XCircle, Clock, BarChart3
} from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

type Tab = "overview" | "users" | "transactions" | "rewards" | "settings";

// Demo data
const DEMO_STATS = {
  totalUsers: 1240,
  totalTransactions: 540000,
  rewardsGiven: 12000,
  activeUsers: 856,
  pendingTransactions: 23,
  failedTransactions: 8,
};

const DEMO_USERS = [
  { id: 1, name: "Rahim", balance: 5420, status: "active", transactions: 45 },
  { id: 2, name: "Anas", balance: 3200, status: "active", transactions: 32 },
  { id: 3, name: "Fasil", balance: 8900, status: "active", transactions: 67 },
  { id: 4, name: "Salim", balance: 1500, status: "blocked", transactions: 12 },
  { id: 5, name: "Arif", balance: 6700, status: "active", transactions: 54 },
];

const DEMO_TRANSACTIONS = [
  { id: 1, user: "Rahim", amount: 500, type: "sent", status: "success", time: "2m ago" },
  { id: 2, user: "Anas", amount: 300, type: "received", status: "success", time: "5m ago" },
  { id: 3, user: "Fasil", amount: 1200, type: "sent", status: "pending", time: "10m ago" },
  { id: 4, user: "Salim", amount: 800, type: "sent", status: "failed", time: "15m ago" },
  { id: 5, user: "Arif", amount: 2000, type: "received", status: "success", time: "20m ago" },
];

export function AdminDashboardScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabClick = (tab: Tab) => {
    playClick();
    vibrate(10);
    setActiveTab(tab);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3 border-b border-slate-800">
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
          <div className="flex-1 text-center pr-9">
            <h1 className="text-base font-bold flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => handleTabClick("overview")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
              activeTab === "overview"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabClick("users")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
              activeTab === "users"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleTabClick("transactions")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
              activeTab === "transactions"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => handleTabClick("rewards")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
              activeTab === "rewards"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => handleTabClick("settings")}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
              activeTab === "settings"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
                <Users className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-2xl font-bold text-white">{DEMO_STATS.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-white/70">Total Users</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
                <DollarSign className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-2xl font-bold text-white">₹{(DEMO_STATS.totalTransactions / 1000).toFixed(0)}K</p>
                <p className="text-xs text-white/70">Total Transactions</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-4 shadow-lg">
                <Gift className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-2xl font-bold text-white">₹{(DEMO_STATS.rewardsGiven / 1000).toFixed(0)}K</p>
                <p className="text-xs text-white/70">Rewards Given</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 shadow-lg">
                <Activity className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-2xl font-bold text-white">{DEMO_STATS.activeUsers}</p>
                <p className="text-xs text-white/70">Active Users</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Pending Transactions</span>
                  <span className="font-semibold text-amber-400">{DEMO_STATS.pendingTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Failed Transactions</span>
                  <span className="font-semibold text-red-400">{DEMO_STATS.failedTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Success Rate</span>
                  <span className="font-semibold text-emerald-400">96.5%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {DEMO_TRANSACTIONS.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{tx.user}</p>
                      <p className="text-xs text-slate-400">{tx.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{tx.amount}</p>
                      <p className={`text-xs ${
                        tx.status === "success" ? "text-emerald-400" :
                        tx.status === "pending" ? "text-amber-400" :
                        "text-red-400"
                      }`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {DEMO_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.transactions} transactions</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Balance</span>
                    <span className="font-bold">₹{user.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {DEMO_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {tx.status === "success" && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                    {tx.status === "pending" && <Clock className="h-5 w-5 text-amber-400" />}
                    {tx.status === "failed" && <XCircle className="h-5 w-5 text-red-400" />}
                    <div>
                      <p className="font-semibold">{tx.user}</p>
                      <p className="text-xs text-slate-400">{tx.type} · {tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{tx.amount}</p>
                    <p className={`text-xs ${
                      tx.status === "success" ? "text-emerald-400" :
                      tx.status === "pending" ? "text-amber-400" :
                      "text-red-400"
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold mb-3">Reward Controls</h3>
              <div className="space-y-3">
                <button className="w-full p-3 rounded-xl bg-slate-800 text-left active:scale-95 transition">
                  <p className="font-semibold">Add Cashback</p>
                  <p className="text-xs text-slate-400">Give cashback to users</p>
                </button>
                <button className="w-full p-3 rounded-xl bg-slate-800 text-left active:scale-95 transition">
                  <p className="font-semibold">Edit Rewards</p>
                  <p className="text-xs text-slate-400">Modify reward amounts</p>
                </button>
                <button className="w-full p-3 rounded-xl bg-slate-800 text-left active:scale-95 transition">
                  <p className="font-semibold">Spin Settings</p>
                  <p className="text-xs text-slate-400">Configure spin wheel</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold mb-3">App Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800">
                  <div>
                    <p className="font-semibold">Maintenance Mode</p>
                    <p className="text-xs text-slate-400">Disable app temporarily</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-slate-700 relative">
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-500" />
                  </div>
                </div>
                <button className="w-full p-3 rounded-xl bg-slate-800 text-left active:scale-95 transition">
                  <p className="font-semibold">Feature Toggles</p>
                  <p className="text-xs text-slate-400">Enable/disable features</p>
                </button>
                <button className="w-full p-3 rounded-xl bg-slate-800 text-left active:scale-95 transition">
                  <p className="font-semibold">Activity Logs</p>
                  <p className="text-xs text-slate-400">View admin actions</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Demo Badge */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-full px-4 py-1">
          <p className="text-xs font-semibold text-amber-400">Demo Admin Panel</p>
        </div>
      </div>
    </div>
  );
}
