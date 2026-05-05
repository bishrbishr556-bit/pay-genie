import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Mic, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
  status: "sent" | "delivered" | "seen";
  type: "text" | "payment";
  amount?: number;
};

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Hi!", sender: "other", time: "10:30", status: "seen", type: "text" },
  { id: "2", text: "Hello! How are you?", sender: "me", time: "10:31", status: "seen", type: "text" },
  { id: "3", text: "I'm good. Can you send ₹500?", sender: "other", time: "10:32", status: "seen", type: "text" },
  { id: "4", text: "", sender: "me", time: "10:33", status: "seen", type: "payment", amount: 500 },
  { id: "5", text: "Thanks! 👍", sender: "other", time: "10:34", status: "seen", type: "text" },
];

export function ChatScreen({ onBack, contactName = "Rahim" }: { onBack: () => void; contactName?: string }) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      status: "sent",
      type: "text",
    };

    playClick();
    vibrate(10);
    setMessages([...messages, newMsg]);
    setInput("");

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    // Simulate typing and reply
    setTimeout(() => setTyping(true), 1000);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Got it! 👍",
        sender: "other",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        status: "seen",
        type: "text",
      };
      setMessages((prev) => [...prev, reply]);
      
      // Mark as seen
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.sender === "me" ? { ...m, status: "seen" } : m))
        );
      }, 500);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-slate-800">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold">
          {contactName[0]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{contactName}</p>
          <p className="text-xs text-emerald-400">{online ? "🟢 Online" : "Last seen 2m ago"}</p>
        </div>
        <button onClick={() => { playClick(); vibrate(15); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition">
          <Phone className="h-5 w-5" />
        </button>
        <button onClick={() => { playClick(); vibrate(15); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition">
          <Video className="h-5 w-5" />
        </button>
        <button onClick={() => { playClick(); vibrate(15); }} className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.type === "payment" ? (
              <div className={`max-w-[75%] rounded-2xl p-3 ${msg.sender === "me" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-slate-800"}`}>
                <p className="text-xs opacity-80 mb-1">💰 Payment</p>
                <p className="text-2xl font-bold">₹{msg.amount}</p>
                <p className="text-xs opacity-80 mt-1">{msg.sender === "me" ? "Sent" : "Received"} ✔</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{msg.time}</span>
                  {msg.sender === "me" && <StatusIcon status={msg.status} />}
                </div>
              </div>
            ) : (
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.sender === "me" ? "bg-blue-600" : "bg-slate-800"}`}>
                <p className="text-sm">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
                  <span>{msg.time}</span>
                  {msg.sender === "me" && <StatusIcon status={msg.status} />}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1">
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="h-2 w-2 rounded-full bg-slate-400" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 rounded-full bg-slate-400" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 rounded-full bg-slate-400" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-2">
        <button onClick={() => { playClick(); vibrate(15); }} className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition">
          <Mic className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-10 px-4 rounded-full bg-slate-800 border border-slate-700 text-sm outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center active:scale-90 transition disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "sent") return <Check className="h-3 w-3" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3" />;
  return <CheckCheck className="h-3 w-3 text-blue-400" />;
}
