import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Calendar, Check, Loader2 } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";

type View = "main" | "processing" | "success";

const RECIPIENTS = [
  { id: 1, name: "Rahim", avatar: "R", color: "from-orange-500 to-amber-600" },
  { id: 2, name: "Anas", avatar: "A", color: "from-emerald-500 to-teal-600" },
  { id: 3, name: "Fasil", avatar: "F", color: "from-purple-500 to-fuchsia-600" },
  { id: 4, name: "Salim", avatar: "S", color: "from-blue-500 to-indigo-600" },
];

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Yearly"];

export function SchedulePaymentScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("main");
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0]);
  const [amount, setAmount] = useState("500");
  const [frequency, setFrequency] = useState("Monthly");
  const [startDate, setStartDate] = useState("01 May 2025");
  const [endDate, setEndDate] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  const handleSchedule = async () => {
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Schedule Payment</h1>
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
            {/* Pay to */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Pay to</label>
              <div className="relative">
                <button
                  onClick={() => {
                    playClick();
                    vibrate(10);
                    setShowRecipientDropdown(!showRecipientDropdown);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${selectedRecipient.color} flex items-center justify-center font-bold text-white`}>
                      {selectedRecipient.avatar}
                    </div>
                    <span className="font-semibold">{selectedRecipient.name}</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </button>

                {/* Dropdown */}
                {showRecipientDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden z-20"
                  >
                    {RECIPIENTS.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => {
                          playClick();
                          vibrate(10);
                          setSelectedRecipient(recipient);
                          setShowRecipientDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 transition"
                      >
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${recipient.color} flex items-center justify-center font-bold text-white`}>
                          {recipient.avatar}
                        </div>
                        <span className="font-semibold">{recipient.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Amount</label>
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-3xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-3xl font-bold bg-transparent outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Frequency */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Frequency</label>
              <div className="relative">
                <button
                  onClick={() => {
                    playClick();
                    vibrate(10);
                    setShowFrequencyDropdown(!showFrequencyDropdown);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition"
                >
                  <span className="font-semibold">{frequency}</span>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </button>

                {/* Dropdown */}
                {showFrequencyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden z-20"
                  >
                    {FREQUENCIES.map((freq) => (
                      <button
                        key={freq}
                        onClick={() => {
                          playClick();
                          vibrate(10);
                          setFrequency(freq);
                          setShowFrequencyDropdown(false);
                        }}
                        className="w-full text-left p-4 hover:bg-slate-800 transition font-semibold"
                      >
                        {freq}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Start Date</label>
              <button
                onClick={() => {
                  playClick();
                  vibrate(10);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition"
              >
                <span className="font-semibold">{startDate}</span>
                <Calendar className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* End Date (Optional) */}
            <div className="mb-8">
              <label className="block text-sm text-slate-400 mb-3">End Date (Optional)</label>
              <button
                onClick={() => {
                  playClick();
                  vibrate(10);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition"
              >
                <span className={`font-semibold ${!endDate ? "text-slate-500" : ""}`}>
                  {endDate || "Select Date"}
                </span>
                <Calendar className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg shadow-lg active:scale-[0.98] transition"
            >
              Schedule
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
            <p className="font-semibold text-lg">Scheduling payment...</p>
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
            <h2 className="text-2xl font-bold mb-2">Payment Scheduled!</h2>
            <p className="text-sm text-slate-400 mb-8">
              {frequency} payment of ₹{amount} to {selectedRecipient.name}
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Recipient</span>
                  <span className="font-semibold">{selectedRecipient.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-semibold">₹{amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Frequency</span>
                  <span className="font-semibold">{frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Start Date</span>
                  <span className="font-semibold">{startDate}</span>
                </div>
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
