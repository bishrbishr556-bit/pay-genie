import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Phone, Video, Smile, Paperclip, Mic, Send } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  type: "sent" | "received" | "payment";
  avatar?: string;
  color?: string;
  amount?: string;
}

const MESSAGES: Message[] = [
  { id: 1, sender: "Rahim", text: "Hi all 👋", time: "10:25 AM", type: "received", avatar: "R", color: "from-orange-500 to-amber-600" },
  { id: 2, sender: "Anas", text: "Hello everyone 👋", time: "10:27 AM", type: "received", avatar: "A", color: "from-blue-500 to-indigo-600" },
  { id: 3, sender: "You", text: "Hi guys 👋", time: "10:28 AM", type: "sent" },
  { id: 4, sender: "You", text: "You sent ₹500 to group", time: "10:32 AM", type: "payment", amount: "₹500" },
  { id: 5, sender: "Fasil", text: "Thanks bro 💖", time: "10:33 AM", type: "received", avatar: "F", color: "from-pink-500 to-fuchsia-600" },
];

export function GroupChatScreen({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);

  const handleSend = () => {
    if (!message.trim()) return;
    
    playClick();
    vibrate(15);
    
    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      type: "sent",
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleVoiceCall = () => {
    playClick();
    vibrate(15);
  };

  const handleVideoCall = () => {
    playClick();
    vibrate(15);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">Friends</h1>
                <div className="h-2 w-2 rounded-full bg-purple-500" />
              </div>
              <p className="text-xs text-slate-400">4 members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceCall}
              className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center active:scale-90 transition"
            >
              <Phone className="h-5 w-5 text-purple-400" />
            </button>
            <button
              onClick={handleVideoCall}
              className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center active:scale-90 transition"
            >
              <Video className="h-5 w-5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${msg.type === "sent" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar for received messages */}
              {msg.type === "received" && msg.avatar && (
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                  {msg.avatar}
                </div>
              )}
              
              <div className={`flex flex-col ${msg.type === "sent" ? "items-end" : "items-start"}`}>
                {/* Sender name for received messages */}
                {msg.type === "received" && (
                  <span className="text-xs text-slate-400 mb-1 px-2">{msg.sender}</span>
                )}
                
                {/* Message bubble */}
                {msg.type === "payment" ? (
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl">₹</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{msg.amount}</p>
                        <p className="text-xs text-white/80">to group</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/70 mt-2">{msg.time}</p>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "sent"
                        ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.type === "sent" ? "text-white/70" : "text-slate-400"}`}>
                      {msg.time}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              vibrate(10);
            }}
            className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition shrink-0"
          >
            <Smile className="h-5 w-5 text-slate-400" />
          </button>
          
          <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-500"
            />
            <button
              onClick={() => {
                playClick();
                vibrate(10);
              }}
              className="active:scale-90 transition"
            >
              <Paperclip className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          {message.trim() ? (
            <button
              onClick={handleSend}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center active:scale-90 transition shrink-0 shadow-lg"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => {
                playClick();
                vibrate(10);
              }}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center active:scale-90 transition shrink-0 shadow-lg"
            >
              <Mic className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
