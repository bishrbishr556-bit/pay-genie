import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Loader2 } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";

type View = "form" | "processing" | "success";

const FEATURE_CONFIG: Record<string, { title: string; icon: string; description: string; successMessage: string; fields: { label: string; placeholder?: string; type?: string }[] }> = {
  "upi-id": { title: "UPI ID", icon: "🆔", description: "Manage your UPI ID", successMessage: "UPI ID updated", fields: [{ label: "New UPI ID", placeholder: "name@upi" }] },
  "default-account": { title: "Default Account", icon: "✔", description: "Set default account", successMessage: "Default account updated", fields: [{ label: "Account", placeholder: "HDFC XX1234" }] },
  "account-switch": { title: "Switch Account", icon: "🔄", description: "Switch active account", successMessage: "Account switched", fields: [{ label: "Account", placeholder: "Select account" }] },
  "payment-link": { title: "Payment Link", icon: "🔗", description: "Generate a payment link", successMessage: "Link generated", fields: [{ label: "Amount", placeholder: "₹500", type: "number" }, { label: "Note", placeholder: "Optional" }] },
  "auto-collect": { title: "Auto Collect", icon: "💵", description: "Request money", successMessage: "Request sent", fields: [{ label: "From", placeholder: "Contact name" }, { label: "Amount", placeholder: "₹0", type: "number" }] },
};

export function GenericFeatureScreen({ featureId, onBack }: { featureId: string; onBack: () => void }) {
  const config = FEATURE_CONFIG[featureId] ?? { title: "Feature", icon: "⚙️", description: "Coming soon", successMessage: "Done", fields: [] };
  const [view, setView] = useState<View>("form");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    playClick(); vibrate(15);
    setView("processing");
    await new Promise((r) => setTimeout(r, 1500));
    playSuccess(); vibrate([20, 30, 20]);
    setView("success");
  };

  const handleDone = () => { playClick(); vibrate(15); onBack(); };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      <div className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur px-4 pt-3 pb-3 flex items-center">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">{config.title}</h1>
      </div>

      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.icon}</span>
                <p className="text-sm font-bold text-blue-300">{config.title}</p>
              </div>
              <p className="text-xs text-slate-400">{config.description}</p>
            </div>
            <div className="space-y-3">
              {config.fields.map((field) => (
                <label key={field.label} className="block">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 px-1">{field.label}</span>
                  <input
                    value={formData[field.label] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-blue-500"
                  />
                </label>
              ))}
            </div>
            <button onClick={handleSubmit} className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition">
              Continue
            </button>
          </motion.div>
        )}

        {view === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="font-semibold">Processing...</p>
          </motion.div>
        )}

        {view === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 pt-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <p className="font-bold text-xl">Success!</p>
            <p className="text-sm text-slate-300 mt-2">{config.successMessage}</p>
            <button onClick={handleDone} className="mt-6 w-full h-12 rounded-xl bg-emerald-500 font-bold active:scale-[0.98] transition">
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
