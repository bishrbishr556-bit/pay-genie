import { ArrowLeft, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { playClick } from "@/lib/payment-store";

export function ScannerScreen({ onBack, onScanned }: { onBack: () => void; onScanned: (upi: string) => void }) {
  const fakeScan = () => {
    playClick();
    setTimeout(() => onScanned("anas@okbank"), 1500);
  };

  return (
    <div className="h-full bg-slate-950 text-white relative overflow-hidden">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 z-10 relative">
        <button onClick={onBack}><ArrowLeft className="h-6 w-6" /></button>
        <h2 className="font-bold text-lg">Scan QR</h2>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-64 w-64 border-2 border-white/30 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl" />
          <motion.div
            animate={{ y: [0, 240, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-2 right-2 h-1 bg-emerald-400 shadow-[0_0_12px_2px] shadow-emerald-400"
          />
          <QrCode className="h-full w-full p-8 text-white/20" />
        </div>
      </div>

      <div className="absolute bottom-32 left-0 right-0 px-5 text-center space-y-3">
        <p className="text-sm opacity-80">Align QR code within frame</p>
        <button
          onClick={fakeScan}
          className="bg-white text-slate-900 font-semibold px-6 py-3 rounded-full active:scale-95"
        >
          Simulate scan → anas@okbank
        </button>
      </div>
    </div>
  );
}