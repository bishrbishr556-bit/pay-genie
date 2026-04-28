import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { speakAmount, playSuccess, vibrate } from "@/lib/payment-store";
import { Volume2, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/soundbox")({
  head: () => ({
    meta: [
      { title: "Sound Box — Shop Mode" },
      { name: "description", content: "Shop sound box mode for live payment announcements." },
    ],
  }),
  component: SoundBox,
});

type Event = { amount: number; name: string; ts: number };

function SoundBox() {
  const [last, setLast] = useState<Event | null>(null);
  const [pulse, setPulse] = useState(false);
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);

    const bc = new BroadcastChannel("gpay-soundbox");
    bc.onmessage = (e) => {
      const { amount, name } = e.data;
      handleEvent({ amount, name, ts: Date.now() });
    };
    return () => {
      bc.close();
      window.removeEventListener("online", onOn);
      window.removeEventListener("offline", onOff);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleEvent = (ev: Event) => {
    setLast(ev);
    setPulse(true);
    playSuccess();
    speakAmount(ev.amount, lang);
    vibrate([60, 40, 100]);
    setTimeout(() => setPulse(false), 2000);
  };

  const repeat = () => {
    if (!last) return;
    handleEvent(last);
  };

  const demo = () => {
    const names = ["Anas", "Rahim", "Priya", "Ravi"];
    const amts = [100, 250, 500, 1000];
    handleEvent({ amount: amts[Math.floor(Math.random() * amts.length)], name: names[Math.floor(Math.random() * names.length)], ts: Date.now() });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-emerald-400" />
          <span className="font-bold">SoundBox</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {online ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-yellow-400" />}
          <button
            onClick={() => setLang(lang === "en" ? "ml" : "en")}
            className="px-3 py-1 bg-white/10 rounded-full"
          >
            {lang === "en" ? "EN" : "മല"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {pulse && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 2 }}
              className="absolute h-64 w-64 rounded-full bg-emerald-500"
            />
          </>
        )}

        {last ? (
          <motion.div
            key={last.ts}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
          >
            <p className="text-emerald-400 text-2xl font-semibold mb-2">RECEIVED</p>
            <p className="text-7xl sm:text-9xl font-black tracking-tight">₹{last.amount}</p>
            <p className="text-white/60 mt-4">from {last.name}</p>
            <p className="text-white/40 text-sm mt-1">{new Date(last.ts).toLocaleTimeString()}</p>
          </motion.div>
        ) : (
          <div className="relative z-10">
            <p className="text-white/60 text-xl">Waiting for payments...</p>
            <p className="text-white/30 text-sm mt-2">Open main app & receive money to test</p>
          </div>
        )}

        {pulse && (
          <div className="absolute bottom-32 flex gap-1.5 items-end h-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 bg-emerald-400 rounded-full animate-wave"
                style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 flex gap-3">
        <button
          onClick={demo}
          className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
        >
          🔊 Test sound
        </button>
        <button
          onClick={repeat}
          disabled={!last}
          className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
        >
          🔁 Repeat
        </button>
      </div>
    </div>
  );
}