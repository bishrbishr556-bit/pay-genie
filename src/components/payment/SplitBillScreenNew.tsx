import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, Check, Loader2, X } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

type Contact = { id: string; name: string; avatar: string; amount: number };
type View = "contacts" | "amount" | "split" | "confirm" | "processing" | "success";

const CONTACTS: Omit<Contact, "amount">[] = [
  { id: "1", name: "Rahim", avatar: "R" },
  { id: "2", name: "Anas", avatar: "A" },
  { id: "3", name: "Fasil", avatar: "F" },
  { id: "4", name: "Noufal", avatar: "N" },
  { id: "5", name: "Nabeel", avatar: "N" },
];

export function SplitBillScreenNew({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("contacts");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [totalAmount, setTotalAmount] = useState("");
  const [splitMode, setSplitMode] = useState<"equal" | "manual">("equal");
  const [contacts, setContacts] = useState<Contact[]>([]);

  const handleToggleContact = (id: string) => {
    playClick();
    vibrate(10);
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleContinueToAmount = () => {
    if (selected.size === 0) {
      toast.error("Select at least one contact");
      return;
    }
    playClick();
    vibrate(15);
    setView("amount");
  };

  const handleContinueToSplit = () => {
    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    playClick();
    vibrate(15);

    const selectedContacts = CONTACTS.filter((c) => selected.has(c.id));
    const perPerson = amount / (selected.size + 1); // +1 for self

    setContacts(
      selectedContacts.map((c) => ({
        ...c,
        amount: splitMode === "equal" ? perPerson : 0,
      }))
    );

    setView("split");
  };

  const handleUpdateAmount = (id: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, amount } : c)));
  };

  const handleConfirm = () => {
    const total = contacts.reduce((sum, c) => sum + c.amount, 0);
    const expected = parseFloat(totalAmount);

    if (splitMode === "manual" && Math.abs(total - expected) > 0.01) {
      toast.error(`Total must equal ₹${expected}`);
      return;
    }

    playClick();
    vibrate(15);
    setView("confirm");
  };

  const handleSendRequests = async () => {
    setView("processing");
    playClick();
    vibrate(15);

    // Simulate sending
    await new Promise((r) => setTimeout(r, 2500));

    playSuccess();
    vibrate([20, 30, 20]);
    setView("success");
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur px-4 pt-3 pb-3 flex items-center">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">Split Bill</h1>
      </div>

      <AnimatePresence mode="wait">
        {/* SELECT CONTACTS */}
        {view === "contacts" && (
          <motion.div key="contacts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-gradient-to-br from-purple-600/20 to-fuchsia-600/10 border border-purple-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-400" />
                <p className="text-sm font-bold text-purple-300">Select People</p>
              </div>
              <p className="text-xs text-slate-400">Choose who to split the bill with</p>
            </div>

            <p className="text-xs text-slate-400 mb-2 px-1">{selected.size} selected</p>

            <div className="space-y-2">
              {CONTACTS.map((contact) => {
                const isSelected = selected.has(contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={`w-full rounded-2xl p-3 flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-purple-500/20 border-2 border-purple-500"
                        : "bg-slate-900 border border-slate-800"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-500 to-fuchsia-600"
                        : "bg-slate-800"
                    }`}>
                      {contact.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <p className="text-xs text-slate-400">Tap to {isSelected ? "remove" : "add"}</p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-purple-400" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinueToAmount}
              disabled={selected.size === 0}
              className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 font-bold active:scale-[0.98] transition disabled:opacity-50"
            >
              Continue ({selected.size} people)
            </button>
          </motion.div>
        )}

        {/* ENTER AMOUNT */}
        {view === "amount" && (
          <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
              <p className="text-xs text-slate-400 mb-2">Splitting with</p>
              <div className="flex items-center gap-2">
                {Array.from(selected).slice(0, 4).map((id) => {
                  const contact = CONTACTS.find((c) => c.id === id);
                  return (
                    <div key={id} className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
                      {contact?.avatar}
                    </div>
                  );
                })}
                {selected.size > 4 && (
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                    +{selected.size - 4}
                  </div>
                )}
                <span className="text-sm text-slate-400">+ You</span>
              </div>
            </div>

            <Field label="Total Bill Amount">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold">₹</span>
                <input
                  autoFocus
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full h-14 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-2xl font-bold outline-none focus:border-purple-500"
                />
              </div>
            </Field>

            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-2 px-1">Split Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { playClick(); setSplitMode("equal"); }}
                  className={`h-12 rounded-xl font-semibold transition ${
                    splitMode === "equal"
                      ? "bg-purple-500 text-white"
                      : "bg-slate-900 border border-slate-800"
                  }`}
                >
                  Split Equally
                </button>
                <button
                  onClick={() => { playClick(); setSplitMode("manual"); }}
                  className={`h-12 rounded-xl font-semibold transition ${
                    splitMode === "manual"
                      ? "bg-purple-500 text-white"
                      : "bg-slate-900 border border-slate-800"
                  }`}
                >
                  Custom Split
                </button>
              </div>
            </div>

            <button
              onClick={handleContinueToSplit}
              className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 font-bold active:scale-[0.98] transition"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* SPLIT DETAILS */}
        {view === "split" && (
          <motion.div key="split" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
              <p className="text-xs text-slate-400">Total Amount</p>
              <p className="text-3xl font-bold">₹{totalAmount}</p>
              <p className="text-xs text-slate-400 mt-1">Split among {selected.size + 1} people</p>
            </div>

            <p className="text-xs text-slate-400 mb-2 px-1">Amount per person</p>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-bold">
                    {contact.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{contact.name}</p>
                  </div>
                  {splitMode === "manual" ? (
                    <input
                      value={contact.amount || ""}
                      onChange={(e) => handleUpdateAmount(contact.id, e.target.value)}
                      inputMode="decimal"
                      placeholder="0"
                      className="w-24 h-9 px-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-right outline-none focus:border-purple-500"
                    />
                  ) : (
                    <p className="font-bold">₹{contact.amount.toFixed(2)}</p>
                  )}
                </div>
              ))}

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">You</p>
                </div>
                <p className="font-bold text-emerald-400">
                  ₹{(parseFloat(totalAmount) / (selected.size + 1)).toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 font-bold active:scale-[0.98] transition"
            >
              Send Requests
            </button>
          </motion.div>
        )}

        {/* CONFIRM */}
        {view === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <Users className="h-7 w-7 text-purple-400" />
            </div>
            <p className="font-bold text-lg">Confirm Split</p>
            <p className="text-sm text-slate-300 mt-2">Send payment requests to {selected.size} people?</p>

            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-3">Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Bill</span>
                  <span className="font-bold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Your Share</span>
                  <span className="font-bold text-emerald-400">
                    ₹{(parseFloat(totalAmount) / (selected.size + 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requests</span>
                  <span className="font-bold">{selected.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendRequests}
              className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 font-bold active:scale-[0.98] transition"
            >
              Confirm & Send
            </button>
            <button
              onClick={() => setView("split")}
              className="mt-2 w-full h-10 rounded-xl text-slate-400 text-sm"
            >
              Go Back
            </button>
          </motion.div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="font-semibold">Sending Requests...</p>
            <p className="text-xs text-slate-400 mt-1">Please wait</p>
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
            <p className="font-bold text-xl">Requests Sent!</p>
            <p className="text-sm text-slate-300 mt-2">Payment requests sent to {selected.size} people</p>

            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-3">Sent to</p>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
                        {contact.avatar}
                      </div>
                      <span>{contact.name}</span>
                    </div>
                    <span className="font-bold">₹{contact.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { playClick(); vibrate(15); onBack(); }}
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
