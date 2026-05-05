import { motion } from "framer-motion";
import { ChevronLeft, Copy, Users, Gift } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { toast } from "sonner";

export function ReferralScreen({ onBack }: { onBack: () => void }) {
  const referralCode = "ANAS123";
  const totalReferrals = 23;
  const rewardsEarned = 1250;

  const handleCopyCode = () => {
    playClick();
    vibrate(15);
    navigator.clipboard.writeText(referralCode);
    playSuccess();
    toast.success("Referral code copied!");
  };

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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Referral Program</h1>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-xs opacity-80 mb-1">Your Referral Code</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold tracking-wider">{referralCode}</p>
              <button
                onClick={handleCopyCode}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-90 transition"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <p className="text-xs text-slate-400">Total Referrals</p>
          </div>
          <p className="text-2xl font-bold">{totalReferrals}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-emerald-400" />
            <p className="text-xs text-slate-400">Rewards Earned</p>
          </div>
          <p className="text-2xl font-bold">₹{rewardsEarned}</p>
        </div>
      </div>

      {/* Share Button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => {
            playClick();
            vibrate(15);
            playSuccess();
            toast.success("Opening share options...");
          }}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition"
        >
          Share Code
        </button>
      </div>

      {/* How it works */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold mb-3">How it works?</h3>
        <p className="text-xs text-slate-400 mb-4">
          Invite friends and earn ₹100 for each successful referral when they complete their first transaction.
        </p>
      </div>

      {/* Recent Referrals */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3">Recent Referrals</h3>
        <div className="space-y-2">
          {[
            { name: "Rahim", status: "Completed", reward: "₹100", color: "from-emerald-500 to-teal-600" },
            { name: "Fasil", status: "Pending", reward: "₹0", color: "from-blue-500 to-indigo-600" },
            { name: "Salim", status: "Completed", reward: "₹100", color: "from-purple-500 to-fuchsia-600" },
          ].map((ref, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${ref.color} flex items-center justify-center font-bold text-white shrink-0`}>
                {ref.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{ref.name}</p>
                <p className="text-xs text-slate-400">{ref.status}</p>
              </div>
              <p className={`text-sm font-bold ${ref.status === "Completed" ? "text-emerald-400" : "text-slate-500"}`}>
                {ref.reward}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
