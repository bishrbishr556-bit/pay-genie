import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, AlertCircle } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";

const ADMIN_PIN = "123"; // Admin PIN

export function AdminPinScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      playClick();
      vibrate(10);
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      // Auto-check when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => checkPin(newPin), 300);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      playClick();
      vibrate(10);
      setPin(pin.slice(0, -1));
      setError(false);
    }
  };

  const checkPin = (pinToCheck: string) => {
    if (pinToCheck === ADMIN_PIN) {
      playSuccess();
      vibrate([20, 30, 20]);
      onSuccess();
    } else {
      setError(true);
      vibrate([50, 100, 50]);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Admin Access</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: error ? [1, 1.1, 0.9, 1] : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`h-20 w-20 rounded-full mb-8 flex items-center justify-center ${
            error
              ? "bg-gradient-to-br from-red-500 to-rose-600"
              : "bg-gradient-to-br from-purple-500 to-fuchsia-600"
          }`}
        >
          {error ? (
            <AlertCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
          ) : (
            <Lock className="h-10 w-10 text-white" strokeWidth={2.5} />
          )}
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">Enter Admin PIN</h2>
        <p className="text-sm text-slate-400 mb-8">
          {error ? "Incorrect PIN. Try again." : "Enter your 3-digit admin PIN"}
        </p>

        {/* PIN Display */}
        <div className="flex gap-4 mb-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: pin.length === i ? [1, 1.2, 1] : 1,
                backgroundColor: error
                  ? "rgb(239, 68, 68)"
                  : pin.length > i
                  ? "rgb(168, 85, 247)"
                  : "rgb(51, 65, 85)",
              }}
              transition={{ duration: 0.2 }}
              className="h-4 w-4 rounded-full"
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-xs">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 rounded-2xl bg-slate-800 font-bold text-xl active:scale-95 transition"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div />
            <button
              onClick={() => handleNumberClick("0")}
              className="h-16 rounded-2xl bg-slate-800 font-bold text-xl active:scale-95 transition"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-slate-800 font-bold text-xl active:scale-95 transition"
            >
              ←
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-slate-600 mt-8">Demo PIN: 123</p>
      </div>
    </div>
  );
}
