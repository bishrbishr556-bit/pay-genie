import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Smartphone, Nfc, Check } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";

type View = "input" | "ready" | "processing" | "success";

export function TapToPayScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("input");
  const [amount, setAmount] = useState("750");

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    playClick();
    vibrate(15);
    setView("ready");
  };

  const handleTap = async () => {
    playClick();
    vibrate([20, 10, 20]);
    setView("processing");

    await new Promise((r) => setTimeout(r, 2000));

    playSuccess();
    vibrate([30, 20, 30]);
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Tap to Pay</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* INPUT AMOUNT */}
        {view === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-8"
          >
            <div className="text-center mb-8">
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <Nfc className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">NFC Tap to Pay</h2>
              <p className="text-sm text-slate-400">Enter amount to pay via contactless</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <label className="block mb-2">
                <span className="text-xs text-slate-400">Amount</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-4xl font-bold bg-transparent outline-none"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* READY TO TAP */}
        {view === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-4 pt-8 text-center"
          >
            {/* NFC Animation */}
            <div className="relative h-64 flex items-center justify-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute h-48 w-48 rounded-full bg-blue-500/10"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                className="absolute h-40 w-40 rounded-full bg-blue-500/20"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                className="absolute h-32 w-32 rounded-full bg-blue-500/30"
              />
              
              {/* Phone and POS Terminal Illustration */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-8">
                  {/* Phone */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative"
                  >
                    <div className="h-32 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-slate-800 flex items-center justify-center shadow-2xl">
                      <Nfc className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute -right-2 top-1/2 -translate-y-1/2"
                    >
                      <div className="flex gap-1">
                        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* POS Terminal */}
                  <div className="h-24 w-16 rounded-lg bg-slate-700 border-2 border-slate-600 relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 h-8 w-12 bg-slate-800 rounded"></div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-0.5">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-sm bg-slate-600"></div>
                      ))}
                    </div>
                    <div className="absolute -right-1 top-1/3 h-1 w-1 rounded-full bg-orange-500"></div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">Hold your phone near<br />the receiver</h2>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
              <p className="text-xs text-slate-400 mb-1">Amount</p>
              <p className="text-3xl font-bold">₹ {amount}</p>
            </div>

            <p className="text-sm text-slate-400 mb-8">
              Tap your phone to initiate payment
            </p>

            <button
              onClick={handleTap}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition"
            >
              Tap to Pay
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-16 w-16 mx-auto mb-6"
            >
              <Nfc className="h-16 w-16 text-blue-400" />
            </motion.div>
            <p className="font-semibold text-lg">Processing payment...</p>
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
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-sm text-slate-400 mb-8">Your contactless payment was completed</p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800">
                <span className="text-sm text-slate-400">Amount Paid</span>
                <span className="text-2xl font-bold text-emerald-400">₹ {amount}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-semibold">NFC Tap to Pay</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
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
