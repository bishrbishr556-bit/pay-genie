import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, X, Check, Loader2 } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";

type View = "main" | "add-recipient" | "processing" | "success";

interface Recipient {
  id: number;
  name: string;
  avatar: string;
  color: string;
  amount: number;
}

const AVAILABLE_CONTACTS = [
  { name: "Rahim", avatar: "R", color: "from-orange-500 to-amber-600" },
  { name: "Anas", avatar: "A", color: "from-blue-500 to-indigo-600" },
  { name: "Fasil", avatar: "F", color: "from-pink-500 to-fuchsia-600" },
  { name: "Salim", avatar: "S", color: "from-green-500 to-emerald-600" },
  { name: "Zain", avatar: "Z", color: "from-purple-500 to-violet-600" },
  { name: "Arif", avatar: "A", color: "from-cyan-500 to-teal-600" },
  { name: "Imran", avatar: "I", color: "from-rose-500 to-red-600" },
  { name: "Karim", avatar: "K", color: "from-yellow-500 to-orange-600" },
];

export function BulkPayScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("main");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, name: "Rahim", avatar: "R", color: "from-orange-500 to-amber-600", amount: 500 },
    { id: 2, name: "Anas", avatar: "A", color: "from-blue-500 to-indigo-600", amount: 300 },
    { id: 3, name: "Fasil", avatar: "F", color: "from-pink-500 to-fuchsia-600", amount: 200 },
    { id: 4, name: "Salim", avatar: "S", color: "from-green-500 to-emerald-600", amount: 400 },
  ]);
  const [selectedContact, setSelectedContact] = useState<typeof AVAILABLE_CONTACTS[0] | null>(null);
  const [newAmount, setNewAmount] = useState("");

  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);

  const handleRemoveRecipient = (id: number) => {
    playClick();
    vibrate(15);
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const handleAddMore = () => {
    playClick();
    vibrate(15);
    setView("add-recipient");
    setSelectedContact(null);
    setNewAmount("");
  };

  const handleSelectContact = (contact: typeof AVAILABLE_CONTACTS[0]) => {
    playClick();
    vibrate(10);
    setSelectedContact(contact);
  };

  const handleAddRecipient = () => {
    if (!selectedContact || !newAmount || parseFloat(newAmount) <= 0) return;
    
    playClick();
    vibrate(15);
    
    const newRecipient: Recipient = {
      id: Date.now(),
      name: selectedContact.name,
      avatar: selectedContact.avatar,
      color: selectedContact.color,
      amount: parseFloat(newAmount),
    };
    
    setRecipients([...recipients, newRecipient]);
    setView("main");
  };

  const handlePayNow = async () => {
    if (recipients.length === 0) return;
    
    playClick();
    vibrate(15);
    setView("processing");

    await new Promise((r) => setTimeout(r, 2500));

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
              if (view === "add-recipient") {
                setView("main");
              } else {
                onBack();
              }
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-9">
            {view === "add-recipient" ? "Add Recipient" : "Bulk Payment"}
          </h1>
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
            {/* Add Recipients Label */}
            <h2 className="text-sm text-slate-400 mb-4">Add Recipients</h2>

            {/* Recipients List */}
            <div className="space-y-3 mb-6">
              {recipients.map((recipient, index) => (
                <motion.div
                  key={recipient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${recipient.color} flex items-center justify-center font-bold text-white text-lg`}>
                      {recipient.avatar}
                    </div>
                    <span className="font-semibold">{recipient.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">₹{recipient.amount}</span>
                    <button
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              onClick={handleAddMore}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition mb-8"
            >
              <Plus className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-purple-400">Add More</span>
            </button>

            {/* Total Amount */}
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-2">Total Amount</p>
              <p className="text-4xl font-bold">₹ {totalAmount.toLocaleString()}</p>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={recipients.length === 0}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg shadow-lg active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Now
            </button>
          </motion.div>
        )}

        {/* ADD RECIPIENT VIEW */}
        {view === "add-recipient" && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-6"
          >
            {/* Select Contact */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Select Contact</label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_CONTACTS.map((contact) => (
                  <button
                    key={contact.name}
                    onClick={() => handleSelectContact(contact)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition ${
                      selectedContact?.name === contact.name
                        ? "bg-purple-500/20 border-2 border-purple-500"
                        : "bg-slate-900 border border-slate-800 active:bg-slate-800"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center font-bold text-white`}>
                      {contact.avatar}
                    </div>
                    <span className="font-semibold text-sm">{contact.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm text-slate-400 mb-3">Amount</label>
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-3xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="flex-1 text-3xl font-bold bg-transparent outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddRecipient}
              disabled={!selectedContact || !newAmount || parseFloat(newAmount) <= 0}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg shadow-lg active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Recipient
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
            <p className="font-semibold text-lg">Processing Bulk Payment...</p>
            <p className="text-sm text-slate-400 mt-2">Sending to {recipients.length} recipients</p>
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
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-sm text-slate-400 mb-8">
              ₹{totalAmount.toLocaleString()} sent to {recipients.length} recipients
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <h3 className="text-sm text-slate-400 mb-4">Payment Details</h3>
              <div className="space-y-3">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${recipient.color} flex items-center justify-center font-bold text-white text-xs`}>
                        {recipient.avatar}
                      </div>
                      <span className="text-sm font-semibold">{recipient.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">₹{recipient.amount}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-800 flex justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
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
