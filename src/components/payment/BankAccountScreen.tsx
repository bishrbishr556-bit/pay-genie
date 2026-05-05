import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Building2, Check, Loader2, AlertCircle } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

type View = "select" | "details" | "verify" | "success";

const BANKS = [
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "sbi", name: "State Bank of India", logo: "🏛️" },
  { id: "icici", name: "ICICI Bank", logo: "🏢" },
  { id: "axis", name: "Axis Bank", logo: "🏪" },
  { id: "kotak", name: "Kotak Mahindra", logo: "🏬" },
  { id: "pnb", name: "Punjab National Bank", logo: "🏦" },
];

export function BankAccountScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("select");
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBankSelect = (bank: typeof BANKS[0]) => {
    playClick();
    vibrate(15);
    setSelectedBank(bank);
    setView("details");
  };

  const handleSubmitDetails = async () => {
    if (!accountNumber || accountNumber.length < 9) {
      toast.error("Enter valid account number");
      return;
    }
    if (accountNumber !== confirmAccount) {
      toast.error("Account numbers don't match");
      return;
    }
    if (!ifsc || ifsc.length !== 11) {
      toast.error("Enter valid IFSC code");
      return;
    }

    setLoading(true);
    playClick();
    vibrate(15);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    
    setLoading(false);
    playSuccess();
    toast.success("OTP sent to registered mobile");
    setView("verify");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    setLoading(true);
    playClick();
    vibrate(15);

    // Simulate verification
    await new Promise((r) => setTimeout(r, 2000));
    
    setLoading(false);
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
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">Add Bank Account</h1>
      </div>

      <AnimatePresence mode="wait">
        {/* SELECT BANK */}
        {view === "select" && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-bold text-blue-300">Select Your Bank</p>
              </div>
              <p className="text-xs text-slate-400">Choose your bank to link your account</p>
            </div>

            <div className="space-y-2">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl">
                    {bank.logo}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{bank.name}</p>
                    <p className="text-xs text-slate-400">Link via account number</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-slate-500 rotate-180" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ENTER DETAILS */}
        {view === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl">
                {selectedBank?.logo}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedBank?.name}</p>
                <p className="text-xs text-slate-400">Enter account details</p>
              </div>
            </div>

            <div className="space-y-3">
              <Field label="Account Number">
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="Enter account number"
                  className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-blue-500"
                />
              </Field>

              <Field label="Confirm Account Number">
                <input
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="Re-enter account number"
                  className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-blue-500"
                />
              </Field>

              <Field label="IFSC Code">
                <input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  maxLength={11}
                  placeholder="e.g., HDFC0001234"
                  className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-blue-500 uppercase"
                />
              </Field>
            </div>

            <button
              onClick={handleSubmitDetails}
              disabled={loading}
              className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
            </button>
          </motion.div>
        )}

        {/* VERIFY OTP */}
        {view === "verify" && (
          <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="h-7 w-7 text-blue-400" />
            </div>
            <p className="font-bold text-lg">Verify OTP</p>
            <p className="text-xs text-slate-400 mb-4">Enter OTP sent to your registered mobile</p>

            <Field label="Enter 6-digit OTP">
              <input
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-lg outline-none focus:border-blue-500 tracking-[0.5em] text-center"
              />
            </Field>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Link"}
            </button>

            <button onClick={() => toast.success("OTP resent")} className="mt-2 text-xs text-blue-400">Resend OTP</button>
          </motion.div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 pt-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40"
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <p className="font-bold text-xl">Account Linked!</p>
            <p className="text-sm text-slate-300 mt-2">{selectedBank?.name}</p>
            <p className="text-xs text-slate-400 mt-1">A/C ••••{accountNumber.slice(-4)}</p>

            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-2">Account Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank</span>
                  <span className="font-semibold">{selectedBank?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC</span>
                  <span className="font-semibold">{ifsc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 font-semibold">✔ Active</span>
                </div>
              </div>
            </div>

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
      <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 px-1">{label}</span>
      {children}
    </label>
  );
}
