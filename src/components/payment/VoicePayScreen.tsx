import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { actions, playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

type Step = "idle" | "listening" | "parsed" | "processing" | "success";

const SAMPLE_PHRASES = [
  "Send 100 to Rahim",
  "Pay 250 to Priya",
  "Send 500 to Anas",
  "Transfer 50 to Nabeel",
];

function parse(text: string): { name: string; amount: number } | null {
  const m = text.toLowerCase().match(/(?:send|pay|transfer)\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:rupees?|rs\.?|₹)?\s*to\s+([a-z]+)/i);
  if (!m) return null;
  const amount = parseInt(m[1], 10);
  const name = m[2].charAt(0).toUpperCase() + m[2].slice(1);
  if (!amount || amount <= 0) return null;
  return { name, amount };
}

export function VoicePayScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<{ name: string; amount: number } | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const recRef = useRef<unknown>(null);

  useEffect(() => {
    if (step !== "idle") return;
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % SAMPLE_PHRASES.length), 2200);
    return () => clearInterval(t);
  }, [step]);

  const startListen = () => {
    playClick(); vibrate(20);
    setTranscript("");
    setParsed(null);
    setStep("listening");

    type SR = { new (): { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void } };
    const W = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const SRClass = W.SpeechRecognition || W.webkitSpeechRecognition;

    if (SRClass) {
      const r = new SRClass();
      r.lang = "en-IN";
      r.interimResults = false;
      r.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        const p = parse(text);
        if (p) { setParsed(p); setStep("parsed"); }
        else { toast.error("Couldn't understand. Try: Send 100 to Rahim"); setStep("idle"); }
      };
      r.onerror = () => { toast.error("Mic error — using demo"); fallbackDemo(); };
      r.onend = () => { /* noop */ };
      try { r.start(); recRef.current = r; } catch { fallbackDemo(); }
      // safety timeout
      setTimeout(() => { if (step === "listening") try { r.stop(); } catch {} }, 6000);
    } else {
      fallbackDemo();
    }
  };

  const fallbackDemo = () => {
    setTimeout(() => {
      const phrase = SAMPLE_PHRASES[phraseIdx];
      setTranscript(phrase);
      const p = parse(phrase)!;
      setParsed(p);
      setStep("parsed");
    }, 1800);
  };

  const confirmPay = () => {
    if (!parsed) return;
    playClick(); vibrate(15);
    setStep("processing");
    setTimeout(() => {
      actions.sendMoney(parsed.name, `${parsed.name.toLowerCase()}@upi`, parsed.amount, "Voice Pay");
      playSuccess(); vibrate([20, 60, 20]);
      setStep("success");
    }, 1600);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-card">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 active:scale-90">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Mic className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Voice Pay</h1>
            <p className="text-xs opacity-90 mt-1">Speak naturally · Hands-free payments</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-3xl shadow-card p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold">Payment Successful</h2>
              <p className="text-sm text-muted-foreground mt-1">₹{parsed?.amount} sent to {parsed?.name}</p>
              <button onClick={onBack} className="mt-6 w-full bg-primary text-primary-foreground rounded-2xl py-3 font-semibold active:scale-[0.98]">Done</button>
            </motion.div>
          ) : step === "processing" ? (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-3xl shadow-card p-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="mt-3 font-semibold">Processing payment…</p>
              <p className="text-xs text-muted-foreground">Securing transaction with bank</p>
            </motion.div>
          ) : step === "parsed" && parsed ? (
            <motion.div key="parsed" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
              <div className="bg-card rounded-2xl shadow-card p-4">
                <p className="text-[11px] text-muted-foreground">You said</p>
                <p className="font-medium mt-1">"{transcript}"</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 rounded-2xl p-5 border border-rose-200/40">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI detected</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold">₹{parsed.amount}</span>
                  <span className="text-sm">to</span>
                  <span className="text-lg font-semibold">{parsed.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setStep("idle"); setParsed(null); }} className="bg-muted rounded-2xl py-3 font-semibold active:scale-[0.98]">Retry</button>
                <button onClick={confirmPay} className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl py-3 font-semibold active:scale-[0.98] shadow-md">Confirm Pay</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="relative mx-auto w-44 h-44 flex items-center justify-center">
                {step === "listening" && (
                  <>
                    <motion.div animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} className="absolute inset-0 rounded-full bg-rose-500/40" />
                    <motion.div animate={{ scale: [1, 1.4], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="absolute inset-0 rounded-full bg-rose-500/40" />
                  </>
                )}
                <button onClick={step === "listening" ? () => setStep("idle") : startListen}
                  className={`relative h-32 w-32 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform ${step === "listening" ? "bg-rose-500" : "bg-gradient-to-br from-rose-500 to-pink-600"} text-white`}>
                  {step === "listening" ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
                </button>
              </div>
              <p className="mt-5 font-semibold">{step === "listening" ? "Listening…" : "Tap to speak"}</p>
              <AnimatePresence mode="wait">
                <motion.p key={phraseIdx} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }}
                  className="text-sm text-muted-foreground mt-1">
                  Try: "{SAMPLE_PHRASES[phraseIdx]}"
                </motion.p>
              </AnimatePresence>
              {transcript && step === "listening" && (
                <p className="mt-4 text-sm font-medium">"{transcript}"</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}