import { useState } from "react";
import { actions, playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export function LockScreen() {
  const [pin, setPin] = useState("");
  const [scanning, setScanning] = useState(false);

  const press = (n: string) => {
    if (pin.length >= 4) return;
    playClick();
    vibrate(10);
    const next = pin + n;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        actions.unlock();
        playSuccess();
      }, 300);
    }
  };

  const fingerprint = () => {
    setScanning(true);
    vibrate(30);
    setTimeout(() => {
      actions.unlock();
      playSuccess();
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-16 px-8 gradient-primary text-primary-foreground">
      <div className="text-center mt-12">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
          G
        </div>
        <p className="mt-3 font-bold text-xl">GPay Demo</p>
        <p className="text-xs opacity-80 mt-1">Enter PIN to continue</p>
      </div>

      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: pin.length > i ? 1.2 : 1 }}
            className={`h-4 w-4 rounded-full border-2 border-white ${pin.length > i ? "bg-white" : ""}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => press(String(n))}
            className="h-16 rounded-2xl bg-white/15 backdrop-blur font-bold text-2xl active:scale-90 transition-transform"
          >
            {n}
          </button>
        ))}
        <button
          onClick={fingerprint}
          className="h-16 rounded-2xl bg-white/15 backdrop-blur active:scale-90 flex items-center justify-center"
        >
          <motion.div animate={scanning ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: scanning ? Infinity : 0, duration: 0.6 }}>
            <Fingerprint className="h-7 w-7" />
          </motion.div>
        </button>
        <button onClick={() => press("0")} className="h-16 rounded-2xl bg-white/15 backdrop-blur font-bold text-2xl active:scale-90">
          0
        </button>
        <button onClick={() => { setPin(pin.slice(0, -1)); playClick(); }} className="h-16 rounded-2xl bg-white/15 backdrop-blur active:scale-90 text-sm">
          ⌫
        </button>
      </div>

      <p className="text-xs opacity-70">Any PIN works · Tap fingerprint</p>
    </div>
  );
}