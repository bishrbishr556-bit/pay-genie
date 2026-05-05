import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Delete } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

export function PinPad({
  length = 4,
  onComplete,
  onBiometric,
  showBiometric = false,
  shake = false,
  initialError = "",
}: {
  length?: number;
  onComplete: (pin: string) => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  shake?: boolean;
  initialError?: string;
}) {
  const [pin, setPin] = useState("");

  const press = (n: string) => {
    if (pin.length >= length) return;
    playClick(); vibrate(8);
    const next = pin + n;
    setPin(next);
    if (next.length === length) {
      setTimeout(() => { onComplete(next); setPin(""); }, 180);
    }
  };

  const back = () => { playClick(); setPin(pin.slice(0, -1)); };

  return (
    <div className="flex flex-col items-center">
      <motion.div animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}} className="flex gap-3 mb-8">
        {Array.from({ length }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: pin.length > i ? 1.15 : 1 }}
            className={`h-4 w-4 rounded-full border-2 ${
              pin.length > i ? "bg-blue-400 border-blue-400 shadow-lg shadow-blue-400/50" : "border-white/40"
            }`}
          />
        ))}
      </motion.div>
      {initialError && <p className="text-rose-400 text-sm mb-4">{initialError}</p>}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => press(String(n))}
            className="h-14 rounded-2xl bg-white/10 backdrop-blur font-bold text-2xl active:scale-90 active:bg-white/20 transition"
          >
            {n}
          </button>
        ))}
        {showBiometric && onBiometric ? (
          <button onClick={onBiometric} className="h-14 rounded-2xl bg-white/10 active:scale-90 flex items-center justify-center">
            <Fingerprint className="h-6 w-6" />
          </button>
        ) : (
          <div />
        )}
        <button onClick={() => press("0")} className="h-14 rounded-2xl bg-white/10 font-bold text-2xl active:scale-90">0</button>
        <button onClick={back} className="h-14 rounded-2xl bg-white/10 active:scale-90 flex items-center justify-center">
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
