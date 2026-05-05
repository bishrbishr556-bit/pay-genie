import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Loader2, Building2, Plus, Radio, MapPin, Smartphone, Calendar, Repeat, Wallet, Link as LinkIcon, Users, Nfc } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

type View = "main" | "processing" | "success";

type FeatureType = 
  | "check-balance" | "mini-statement" | "upi-settings" | "upi-id" 
  | "default-account" | "account-switch" | "bulk-payment" | "payment-link"
  | "pay-nearby" | "tap-to-pay" | "scheduled-pay" | "auto-pay" | "auto-collect";

const ACCOUNTS = [
  { id: 1, bank: "HDFC Bank", number: "XX1234", balance: 25430.50, icon: "🏦" },
  { id: 2, bank: "SBI Bank", number: "XX5678", balance: 15240.00, icon: "🏦" },
  { id: 3, bank: "ICICI Bank", number: "XX9012", balance: 8750.25, icon: "🏦" },
];

const UPI_IDS = [
  { id: 1, upi: "user@hdfc", name: "HDFC Bank", primary: true, enabled: true },
  { id: 2, upi: "user@sbi", name: "SBI Bank", primary: false, enabled: true },
  { id: 3, upi: "9876543210@paytm", name: "Linked Mobile", primary: false, enabled: false },
];

const TRANSACTIONS = [
  { id: 1, name: "Sent to Rahim", amount: -500, category: "Transfer", date: "Today, 10:30 am" },
  { id: 2, name: "Received from Anas", amount: 1200, category: "Transfer", date: "Today, 09:15 am" },
  { id: 3, name: "Electricity Bill", amount: -850, category: "Bills", date: "Yesterday, 03:45 pm" },
  { id: 4, name: "Airtel Recharge", amount: -299, category: "Recharge", date: "Yesterday, 11:20 am" },
  { id: 5, name: "UPI to Zomato", amount: -420, category: "Food", date: "28 Apr, 08:30 pm" },
];

const RECIPIENTS = [
  { id: 1, name: "Rahim", avatar: "R", amount: 500 },
  { id: 2, name: "Anas", avatar: "A", amount: 300 },
  { id: 3, name: "Fasil", avatar: "F", amount: 200 },
  { id: 4, name: "Salim", avatar: "S", amount: 400 },
];

const NEARBY_USERS = [
  { id: 1, name: "Rahim", avatar: "R", distance: "20 m" },
  { id: 2, name: "Anas", avatar: "A", distance: "35 m" },
  { id: 3, name: "Fasil", avatar: "F", distance: "50 m" },
  { id: 4, name: "Salim", avatar: "S", distance: "80 m" },
];

export function GenericFeatureScreen({ 
  featureId, 
  onBack 
}: { 
  featureId: FeatureType; 
  onBack: () => void;
}) {
  const [view, setView] = useState<View>("main");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedUPI, setSelectedUPI] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [date, setDate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  const handleSubmit = async () => {
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
      <div className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur px-4 pt-3 pb-3 flex items-center">
        <button
          onClick={() => {
            playClick();
            vibrate(15);
            onBack();
          }}
          className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">{config.title}</h1>
      </div>

      <AnimatePresence mode="wait">
        {/* FORM */}
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-3"
          >
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.icon}</span>
                <p className="text-sm font-bold text-blue-300">{config.title}</p>
              </div>
              <p className="text-xs text-slate-400">{config.description}</p>
            </div>

            {config.fields.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <AlertCircle className="h-7 w-7 text-blue-400" />
                </div>
                <p className="font-semibold mb-2">Quick Action</p>
                <p className="text-xs text-slate-400 mb-4">
                  This feature is ready to use. Click continue to proceed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {config.fields.map((field) => (
                  <Field key={field.label} label={field.label}>
                    <input
                      value={formData[field.label] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.label]: e.target.value })
                      }
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-blue-500"
                    />
                  </Field>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pt-12 text-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="font-semibold">Processing...</p>
            <p className="text-xs text-slate-400 mt-1">Please wait</p>
          </motion.div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 pt-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40"
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <p className="font-bold text-xl">Success!</p>
            <p className="text-sm text-slate-300 mt-2">{config.successMessage}</p>

            {Object.keys(formData).length > 0 && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-2">Details</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleDone}
              className="mt-6 w-full h-12 rounded-xl bg-emerald-500 font-bold active:scale-[0.98] transition"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
        {label}
      </span>
      {children}
    </label>
  );
}
