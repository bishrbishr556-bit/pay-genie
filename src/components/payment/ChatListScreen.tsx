import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MessageCircle, Phone, Users, UserPlus } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

interface Chat {
  id: number;
  name: string;
  avatar: string;
  color: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread?: boolean;
}

const CHATS: Chat[] = [
  { id: 1, name: "Rahim", avatar: "R", color: "from-emerald-500 to-teal-600", lastMessage: "₹500 sent ✓", time: "2m", online: true },
  { id: 2, name: "Anas", avatar: "A", color: "from-blue-500 to-indigo-600", lastMessage: "Hi bro", time: "5m", online: true },
  { id: 3, name: "Fasil", avatar: "F", color: "from-pink-500 to-fuchsia-600", lastMessage: "Received ₹200", time: "12m", online: true },
  { id: 4, name: "Salim", avatar: "S", color: "from-orange-500 to-amber-600", lastMessage: "Okay", time: "1h", online: true },
  { id: 5, name: "Arif", avatar: "A", color: "from-purple-500 to-violet-600", lastMessage: "Thanks 👍", time: "2h", online: true },
  { id: 6, name: "Jalal", avatar: "J", color: "from-red-500 to-rose-600", lastMessage: "Heyy!!", time: "3h", online: false },
];

export function ChatListScreen({ onBack, onOpenChat }: { onBack: () => void; onOpenChat?: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "calls" | "contacts" | "groups">("chats");

  const filteredChats = CHATS.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chat: Chat) => {
    playClick();
    vibrate(15);
    if (onOpenChat) {
      onOpenChat();
    }
  };

  const handleTabClick = (tab: "chats" | "calls" | "contacts" | "groups") => {
    playClick();
    vibrate(10);
    setActiveTab(tab);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <h1 className="text-2xl font-bold mb-4">Chats</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-slate-700 transition text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filteredChats.map((chat, index) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleChatClick(chat)}
            className="w-full flex items-center gap-3 py-3 active:bg-slate-900/50 rounded-xl transition"
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center font-bold text-white text-lg shrink-0`}>
                {chat.avatar}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-base">{chat.name}</h3>
                <span className="text-xs text-slate-400">{chat.time}</span>
              </div>
              <p className="text-sm text-slate-400 truncate">{chat.lastMessage}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          playClick();
          vibrate(15);
        }}
        className="absolute bottom-24 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg active:scale-90 transition"
      >
        <Plus className="h-6 w-6 text-white" strokeWidth={3} />
      </button>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 px-4 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handleTabClick("chats")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
              activeTab === "chats" ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <MessageCircle className="h-6 w-6" fill={activeTab === "chats" ? "currentColor" : "none"} />
            <span className="text-xs font-medium">Chats</span>
          </button>

          <button
            onClick={() => handleTabClick("calls")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
              activeTab === "calls" ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <Phone className="h-6 w-6" />
            <span className="text-xs font-medium">Calls</span>
          </button>

          <button
            onClick={() => handleTabClick("contacts")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
              activeTab === "contacts" ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <UserPlus className="h-6 w-6" />
            <span className="text-xs font-medium">Contacts</span>
          </button>

          <button
            onClick={() => handleTabClick("groups")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
              activeTab === "groups" ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Groups</span>
          </button>
        </div>
      </div>
    </div>
  );
}
