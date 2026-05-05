import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Check, ChevronRight, Shield, Smartphone } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

const UPI_IDS = [
  { id: 1, upi: "user@hdfc", name: "HDFC Bank", primary: true, enabled: true },
  { id: 2, upi: "user@sbi", name: "SBI Bank", primary: false, enabled: true },
  { id: 3, upi: "9876543210@paytm", name: "Linked Mobile", primary: false, enabled: false },
];

export function UpiSettingsScreen({ onBack }: { onBack: () => void }) {
  const [upis, setUpis] = useState(UPI_IDS);

  const toggleUPI = (id: number) => {
    playClick();
    vibrate(15);
    setUpis(upis.map((upi) => (upi.id === id ? { ...upi, enabled: !upi.enabled } : upi)));
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">UPI Settings</h1>
        </div>
      </div>

      {/* UPI PIN Section */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <p className="text-sm font-bold text-blue-300">UPI PIN</p>
          </div>
          <p className="text-xs text-slate-400 mb-3">Secure your UPI transactions with a 4 or 6 digit PIN</p>
          <button
            onClick={() => {
              playClick();
              vibrate(15);
            }}
            className="w-full h-10 rounded-xl bg-blue-500 font-semibold text-sm active:scale-[0.98] transition"
          >
            Change UPI PIN
          </button>
        </div>
      </div>

      {/* Linked UPI IDs */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3 px-1">Linked Mobile</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">98 7654 3210</p>
              <p className="text-xs text-slate-400">Primary mobile number</p>
            </div>
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Default Account */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3 px-1">Default Account</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
              🏦
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">HDFC Bank - XX1234</p>
              <p className="text-xs text-slate-400">Primary payment account</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* UPI Lite */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3 px-1">UPI Lite</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">Enable UPI Lite</p>
              <p className="text-xs text-slate-400">For small payments without PIN</p>
            </div>
            <button
              onClick={() => {
                playClick();
                vibrate(15);
              }}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto Pay */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3 px-1">Auto Pay Status</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Enabled</p>
              <p className="text-xs text-slate-400">3 active mandates</p>
            </div>
            <button
              onClick={() => {
                playClick();
                vibrate(15);
              }}
              className="text-sm text-blue-400 font-semibold"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* UPI International */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-3 px-1">UPI International</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Disabled</p>
              <p className="text-xs text-slate-400">Enable for international payments</p>
            </div>
            <button
              onClick={() => {
                playClick();
                vibrate(15);
              }}
              className="text-sm text-blue-400 font-semibold"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
