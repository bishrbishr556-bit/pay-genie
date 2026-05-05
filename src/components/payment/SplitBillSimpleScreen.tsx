import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, Check, Loader2 } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";

type View = "main" | "processing" | "success";

const SPLIT_MEMBERS = [
  { id: 1, name: "Rahim", avatar: "R", color: "from-orange-500 to-amber-600" },
  { id: 2, name: "Anas", avatar: "A", color: "from-emerald-500 to-teal-600" },
  { id: 3, name: "Fasil", avatar: "F", color: "from-purple-500 to-fuchsia-600" },
  { id: 4, name: "You", avatar: "Y", color: "from-blue-500 to-indigo-600" },
];

export function SplitBillSimpleScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("main");
  const [totalAmount] = useState(1200);
  const [peopleCount] = useState(4);
  const perPersonAmount = totalAmount / peopleCount;

  const handleRequest = async () => {
    playClick();
    vibrate(15);
    setView("processing");

    await new Promise((r) => setTimeout(r, 2000));

    playSuccess();
    vibrate([20, 30, 20]);
    setView("success");
  };

  const handleDone = () => {
    playClick();
    vibrate(15);
    onBack();
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Split Bill</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* MAIN VIEW */}
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-6"
          >
            {/* Total Amount */}
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-2">Total Amount</p>
              <p className="text-5xl font-bold">₹ {totalAmount}</p>
            </div>

            {/* Split Between */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">Split Between</p>
                <button
                  onClick={() => {
                    playClick();
                    vibrate(10);
                  }}
                  className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center active:scale-90 transition shadow-lg"
                >
                  <Users className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="text-2xl font-bold">{peopleCount} People</p>
            </div>

            {/* Members List */}
            <div className="space-y-3 mb-6">
              {SPLIT_MEMBERS.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                      {member.avatar}
                    </div>
                    <p className="font-semibold">{member.name}</p>
                  </div>
                  <p className="text-lg font-bold">₹{perPersonAmount}</p>
                </motion.div>
              ))}
            </div>

            {/* Request Button */}
            <button
              onClick={handleRequest}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg shadow-lg active:scale-[0.98] transition"
            >
              Request
            </button>
          </motion.div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pt-20 text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-6" />
            <p className="font-semibold text-lg">Sending requests...</p>
            <p className="text-sm text-slate-400 mt-2">Please wait</p>
          </motion.div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 pt-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/40"
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Requests Sent!</h2>
            <p className="text-sm text-slate-400 mb-8">
              Split bill requests sent to {peopleCount - 1} people
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800">
                <span className="text-sm text-slate-400">Total Amount</span>
                <span className="text-2xl font-bold">₹ {totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Split Between</span>
                <span className="font-semibold">{peopleCount} people</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Per Person</span>
                <span className="font-semibold">₹{perPersonAmount}</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full h-12 rounded-xl bg-emerald-500 font-bold active:scale-[0.98] transition"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
