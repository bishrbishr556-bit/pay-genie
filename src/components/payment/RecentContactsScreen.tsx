import { motion } from "framer-motion";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

const RECENT = [
  { id: 1, name: "Rahim", action: "Sent ₹500", time: "2m", avatar: "R", color: "from-emerald-500 to-teal-600" },
  { id: 2, name: "Anas", action: "Voice Call", time: "15m", avatar: "A", color: "from-blue-500 to-indigo-600" },
  { id: 3, name: "Fasil", action: "Request ₹200", time: "1h", avatar: "F", color: "from-pink-500 to-rose-600" },
  { id: 4, name: "Salim", action: "Received ₹1000", time: "3h", avatar: "S", color: "from-cyan-500 to-sky-600" },
  { id: 5, name: "Arif", action: "Video Call", time: "5h", avatar: "A", color: "from-purple-500 to-fuchsia-600" },
  { id: 6, name: "Jabir", action: "Photo", time: "1d", avatar: "J", color: "from-orange-500 to-amber-600" },
];

export function RecentContactsScreen({ onBack }: { onBack: () => void }) {
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Recent</h1>
        </div>
      </div>

      {/* Recent List */}
      <div className="px-4 pt-2">
        {RECENT.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              playClick();
              vibrate(10);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/50 active:bg-slate-900 transition-colors mb-1"
          >
            <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center font-bold text-white shrink-0`}>
              {item.avatar}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-slate-400">{item.action}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{item.time}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
