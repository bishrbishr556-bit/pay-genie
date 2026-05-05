import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Plus, Phone, MessageCircle, Send } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

const CONTACTS = [
  { id: 1, name: "Anas", phone: "98765 43210", avatar: "A", color: "from-blue-500 to-indigo-600" },
  { id: 2, name: "Arif", phone: "98765 43211", avatar: "A", color: "from-purple-500 to-fuchsia-600" },
  { id: 3, name: "Fasil", phone: "98765 43212", avatar: "F", color: "from-pink-500 to-rose-600" },
  { id: 4, name: "Jabir", phone: "98765 43213", avatar: "J", color: "from-orange-500 to-amber-600" },
  { id: 5, name: "Rahim", phone: "98765 43214", avatar: "R", color: "from-emerald-500 to-teal-600" },
  { id: 6, name: "Salim", phone: "98765 43215", avatar: "S", color: "from-cyan-500 to-sky-600" },
];

export function ContactsScreen({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center mb-3">
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Contacts</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="px-4">
        <p className="text-xs text-slate-400 mb-2 px-1">A</p>
        {filteredContacts.map((contact) => (
          <motion.button
            key={contact.id}
            onClick={() => {
              playClick();
              vibrate(10);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/50 active:bg-slate-900 transition-colors mb-1"
          >
            <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center font-bold text-white shrink-0`}>
              {contact.avatar}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">{contact.name}</p>
              <p className="text-xs text-slate-400">{contact.phone}</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-slate-400 rotate-180" />
          </motion.button>
        ))}
      </div>

      {/* Add Contact FAB */}
      <button
        onClick={() => {
          playClick();
          vibrate(15);
        }}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Bottom Actions */}
      <div className="fixed bottom-20 left-0 right-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-900 active:bg-slate-800 transition">
            <Phone className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px]">Call</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-900 active:bg-slate-800 transition">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <span className="text-[10px]">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-900 active:bg-slate-800 transition">
            <Send className="h-5 w-5 text-purple-400" />
            <span className="text-[10px]">Pay</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-900 active:bg-slate-800 transition">
            <Plus className="h-5 w-5 text-slate-400" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
