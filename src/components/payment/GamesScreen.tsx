import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, Coins } from "lucide-react";
import { actions, playClick, playReward, playSuccess, playTick, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

export type GameId =
  | "spin" | "scratch" | "quiz" | "lucky-box"
  | "card-flip" | "tap-earn" | "dice" | "memory";

const GAMES: { id: GameId; title: string; sub: string; cta: string; color: string; emoji: string }[] = [
  { id: "spin",      title: "SPIN WHEEL",   sub: "Win up to ₹1000",  cta: "Play Now", color: "from-purple-600 to-violet-700", emoji: "🎡" },
  { id: "scratch",   title: "SCRATCH CARD", sub: "Scratch & Win",    cta: "Play Now", color: "from-emerald-600 to-green-700", emoji: "🪙" },
  { id: "quiz",      title: "QUIZ GAME",    sub: "Answer & Earn",    cta: "Play Now", color: "from-blue-600 to-indigo-700",   emoji: "❓" },
  { id: "lucky-box", title: "LUCKY BOX",    sub: "Open & Win",       cta: "Play Now", color: "from-rose-600 to-red-700",      emoji: "🎁" },
  { id: "card-flip", title: "CARD FLIP",    sub: "Flip & Win Rewards", cta: "Play Now", color: "from-fuchsia-600 to-purple-700", emoji: "🃏" },
  { id: "tap-earn",  title: "TAP & EARN",   sub: "Tap More, Earn More", cta: "Play Now", color: "from-sky-600 to-blue-700",   emoji: "👆" },
  { id: "dice",      title: "DICE ROLL",    sub: "Roll Dice, Win Big", cta: "Play Now", color: "from-amber-600 to-orange-700", emoji: "🎲" },
  { id: "memory",    title: "MEMORY GAME",  sub: "Match & Win",      cta: "Play Now", color: "from-emerald-600 to-teal-700",  emoji: "🧠" },
];

export function GamesScreen({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<GameId | null>(null);

  const award = (amount: number) => {
    if (amount <= 0) {
      toast("Better luck next time! 😅");
      vibrate(20);
      return;
    }
    actions.receiveMoney("Game Reward", amount);
    playReward();
    vibrate([40, 30, 80]);
    toast.success(`🎉 You won ₹${amount}!`, { description: "Added to your balance" });
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background">
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { playClick(); onBack(); }} className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-xl flex items-center gap-2"><Trophy className="h-5 w-5" /> Play & Earn</h2>
            <p className="text-xs opacity-80">Play games, win real cashback</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {GAMES.map((g) => (
          <motion.button
            key={g.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); vibrate(15); setActive(g.id); }}
            className={`relative overflow-hidden rounded-2xl p-4 text-white text-center bg-gradient-to-br ${g.color} shadow-card`}
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
            <p className="text-xs font-extrabold tracking-wide drop-shadow">{g.title}</p>
            <div className="text-5xl my-3 drop-shadow-lg">{g.emoji}</div>
            <p className="text-[11px] font-semibold opacity-90 mb-2">{g.sub}</p>
            <div className="bg-white/25 backdrop-blur rounded-full text-[11px] font-bold py-1.5 flex items-center justify-center gap-1">
              {g.cta} →
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <GameModal id={active} onClose={() => setActive(null)} onAward={award} />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameModal({ id, onClose, onAward }: { id: GameId; onClose: () => void; onAward: (n: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/70 backdrop-blur z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: 0.95 }}
        className="bg-card rounded-3xl w-full max-w-sm overflow-hidden shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold">{GAMES.find((g) => g.id === id)?.title}</h3>
          <button onClick={onClose} className="text-muted-foreground text-sm">✕</button>
        </div>
        <div className="p-5">
          {id === "spin" && <SpinGame onAward={onAward} />}
          {id === "scratch" && <ScratchGame onAward={onAward} />}
          {id === "quiz" && <QuizGame onAward={onAward} />}
          {id === "lucky-box" && <LuckyBoxGame onAward={onAward} />}
          {id === "card-flip" && <CardFlipGame onAward={onAward} />}
          {id === "tap-earn" && <TapEarnGame onAward={onAward} />}
          {id === "dice" && <DiceGame onAward={onAward} />}
          {id === "memory" && <MemoryGame onAward={onAward} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Individual games ---------- */

function SpinGame({ onAward }: { onAward: (n: number) => void }) {
  const segments = [10, 50, 0, 100, 20, 5, 200, 0];
  const colors = ["#f59e0b", "#10b981", "#6b7280", "#a855f7", "#3b82f6", "#ec4899", "#ef4444", "#6b7280"];
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * segments.length);
    const seg = 360 / segments.length;
    const target = 360 * 5 + (360 - idx * seg - seg / 2);
    setRot(target);
    const tick = setInterval(playTick, 100);
    setTimeout(() => {
      clearInterval(tick);
      setSpinning(false);
      onAward(segments[idx]);
    }, 3500);
  };

  return (
    <div className="text-center">
      <div className="relative w-60 h-60 mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-500" />
        </div>
        <motion.div
          animate={{ rotate: rot }}
          transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full rounded-full shadow-elevated relative"
          style={{ background: `conic-gradient(${segments.map((_, i) => `${colors[i]} ${(i * 100) / segments.length}% ${((i + 1) * 100) / segments.length}%`).join(",")})` }}
        >
          {segments.map((s, i) => {
            const a = (i * 360) / segments.length + 360 / segments.length / 2;
            return (
              <div key={i} className="absolute top-1/2 left-1/2 text-white font-bold text-xs"
                   style={{ transform: `rotate(${a}deg) translateY(-85px)`, transformOrigin: "0 0" }}>
                {s === 0 ? "Try" : `₹${s}`}
              </div>
            );
          })}
        </motion.div>
      </div>
      <button onClick={spin} disabled={spinning}
        className="mt-5 w-full gradient-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-60">
        {spinning ? "Spinning..." : "SPIN NOW"}
      </button>
    </div>
  );
}

function ScratchGame({ onAward }: { onAward: (n: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const prize = useMemo(() => [0, 5, 10, 20, 50, 100][Math.floor(Math.random() * 6)], []);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#a78bfa"); g.addColorStop(1, "#60a5fa");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "white"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Scratch Here", c.width / 2, c.height / 2);
    ctx.font = "14px sans-serif"; ctx.fillText("✨ Use finger ✨", c.width / 2, c.height / 2 + 26);
  }, []);

  const scratch = (x: number, y: number) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    const px = ((x - r.left) / r.width) * c.width;
    const py = ((y - r.top) / r.height) * c.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 40) if (data[i] === 0) cleared++;
    if (cleared / (data.length / 40) > 0.4 && !revealed) {
      setRevealed(true); onAward(prize);
    }
  };

  return (
    <div className="text-center">
      <div className="relative aspect-[4/5] max-w-[240px] mx-auto rounded-2xl overflow-hidden gradient-gold">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {prize > 0 ? (<>
            <Sparkles className="h-8 w-8 text-slate-900 mb-1" />
            <p className="text-[11px] text-slate-700 font-semibold">YOU WON</p>
            <p className="text-4xl font-bold text-slate-900">₹{prize}</p>
          </>) : (<>
            <p className="text-3xl">😅</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">Try Again</p>
          </>)}
        </div>
        {!revealed && (
          <canvas ref={canvasRef} width={240} height={300} className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={(e) => { drawing.current = true; scratch(e.clientX, e.clientY); }}
            onMouseMove={(e) => drawing.current && scratch(e.clientX, e.clientY)}
            onMouseUp={() => { drawing.current = false; }}
            onMouseLeave={() => { drawing.current = false; }}
            onTouchStart={(e) => { drawing.current = true; const t = e.touches[0]; scratch(t.clientX, t.clientY); }}
            onTouchMove={(e) => { const t = e.touches[0]; scratch(t.clientX, t.clientY); }}
            onTouchEnd={() => { drawing.current = false; }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-3">Drag your finger to scratch</p>
    </div>
  );
}

const QUESTIONS = [
  { q: "What does UPI stand for?", a: ["Unified Payment Interface", "Universal Pay India", "United Payment Internet"], c: 0 },
  { q: "Max UPI per transaction?", a: ["₹50,000", "₹1,00,000", "₹10,000"], c: 1 },
  { q: "Which is a UPI app?", a: ["Netflix", "PhonePe", "Spotify"], c: 1 },
  { q: "UPI works without?", a: ["Internet", "Phone", "Bank Account"], c: 0 },
];
function QuizGame({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = QUESTIONS[i];

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.c) { setScore((s) => s + 1); playSuccess(); } else { vibrate(40); }
    setTimeout(() => {
      if (i + 1 < QUESTIONS.length) { setI(i + 1); setPicked(null); }
      else { onAward(score * 10 + (idx === q.c ? 10 : 0)); }
    }, 900);
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">Question {i + 1}/{QUESTIONS.length} · Score {score}</p>
      <p className="font-bold text-base mb-4">{q.q}</p>
      <div className="space-y-2">
        {q.a.map((opt, idx) => {
          const isCorrect = picked !== null && idx === q.c;
          const isWrong = picked === idx && idx !== q.c;
          return (
            <button key={idx} onClick={() => pick(idx)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                isCorrect ? "bg-emerald-500/15 border-emerald-500" :
                isWrong ? "bg-rose-500/15 border-rose-500" :
                "border-border bg-muted/40 active:scale-95"
              }`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LuckyBoxGame({ onAward }: { onAward: (n: number) => void }) {
  const [opened, setOpened] = useState<number | null>(null);
  const prizes = useMemo(() => [0, 5, 10, 20, 50, 100].sort(() => Math.random() - 0.5).slice(0, 3), []);
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground mb-4">Pick one mystery box 🎁</p>
      <div className="grid grid-cols-3 gap-3">
        {prizes.map((p, i) => (
          <button key={i} disabled={opened !== null} onClick={() => { setOpened(i); onAward(p); }}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl shadow-card active:scale-90 transition-transform ${
              opened === i ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
            } ${opened !== null && opened !== i ? "opacity-40" : ""}`}>
            {opened === i ? (p > 0 ? `₹${p}` : "😅") : "🎁"}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardFlipGame({ onAward }: { onAward: (n: number) => void }) {
  const cards = useMemo(() => [10, 25, 50, 100, 0, 5].sort(() => Math.random() - 0.5), []);
  const [flipped, setFlipped] = useState<number | null>(null);
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground mb-4">Flip a card to reveal your prize</p>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((v, i) => (
          <button key={i} disabled={flipped !== null} onClick={() => { setFlipped(i); onAward(v); }}
            className="aspect-[3/4] [perspective:600px] active:scale-95 transition-transform disabled:opacity-60">
            <motion.div animate={{ rotateY: flipped === i ? 180 : 0 }} transition={{ duration: 0.5 }}
              className="relative w-full h-full [transform-style:preserve-3d]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-3xl text-white [backface-visibility:hidden]">?</div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {v > 0 ? `₹${v}` : "😅"}
              </div>
            </motion.div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TapEarnGame({ onAward }: { onAward: (n: number) => void }) {
  const [taps, setTaps] = useState(0);
  const [time, setTime] = useState(10);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) { setRunning(false); onAward(Math.min(100, Math.floor(taps / 2))); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, time, taps, onAward]);

  const start = () => { setTaps(0); setTime(10); setRunning(true); };

  return (
    <div className="text-center">
      <div className="flex justify-around mb-4">
        <div><p className="text-xs text-muted-foreground">Time</p><p className="text-2xl font-bold">{time}s</p></div>
        <div><p className="text-xs text-muted-foreground">Taps</p><p className="text-2xl font-bold">{taps}</p></div>
      </div>
      {running ? (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setTaps((t) => t + 1); playTick(); vibrate(5); }}
          className="w-44 h-44 rounded-full mx-auto bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-2xl shadow-elevated">
          TAP!
        </motion.button>
      ) : (
        <button onClick={start} className="gradient-primary text-primary-foreground font-bold px-8 py-3 rounded-xl">
          {taps > 0 ? "Play Again" : "Start"}
        </button>
      )}
      <p className="text-xs text-muted-foreground mt-3">Earn ₹0.5 per tap (max ₹100)</p>
    </div>
  );
}

function DiceGame({ onAward }: { onAward: (n: number) => void }) {
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const roll = () => {
    if (rolling) return;
    setRolling(true);
    const tick = setInterval(() => setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]), 80);
    setTimeout(() => {
      clearInterval(tick);
      const a = Math.floor(Math.random() * 6) + 1;
      const b = Math.floor(Math.random() * 6) + 1;
      setDice([a, b]); setRolling(false);
      const sum = a + b;
      const prize = sum === 12 ? 200 : sum === 11 ? 100 : sum >= 9 ? 50 : sum >= 6 ? 20 : sum >= 4 ? 10 : 0;
      onAward(prize);
    }, 1500);
  };
  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 my-4">
        <motion.div animate={{ rotate: rolling ? 360 : 0 }} transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
          className="text-7xl">{faces[dice[0] - 1]}</motion.div>
        <motion.div animate={{ rotate: rolling ? -360 : 0 }} transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
          className="text-7xl">{faces[dice[1] - 1]}</motion.div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">Sum: <b>{dice[0] + dice[1]}</b> — Higher = bigger prize</p>
      <button onClick={roll} disabled={rolling}
        className="gradient-primary text-primary-foreground font-bold px-8 py-3 rounded-xl disabled:opacity-60">
        {rolling ? "Rolling..." : "Roll Dice 🎲"}
      </button>
    </div>
  );
}

function MemoryGame({ onAward }: { onAward: (n: number) => void }) {
  const [cards, setCards] = useState<{ v: string; matched: boolean; flipped: boolean }[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const symbols = ["💎", "🎁", "⭐", "💰"];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5)
      .map((v) => ({ v, matched: false, flipped: false }));
    setCards(deck);
  }, []);

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) {
      const prize = Math.max(10, 100 - moves * 5);
      setTimeout(() => onAward(prize), 400);
    }
  }, [cards, moves, onAward]);

  const flip = (i: number) => {
    if (picked.length === 2 || cards[i].flipped) return;
    const next = cards.map((c, j) => j === i ? { ...c, flipped: true } : c);
    const np = [...picked, i];
    setCards(next); setPicked(np); playClick();
    if (np.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = np;
      if (next[a].v === next[b].v) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, j) => j === a || j === b ? { ...c, matched: true } : c));
          setPicked([]); playSuccess();
        }, 500);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c, j) => j === a || j === b ? { ...c, flipped: false } : c));
          setPicked([]);
        }, 800);
      }
    }
  };

  return (
    <div>
      <p className="text-center text-xs text-muted-foreground mb-3">Moves: {moves} · Match all to win</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button key={i} onClick={() => flip(i)} disabled={c.matched}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center shadow active:scale-95 transition-transform ${
              c.flipped || c.matched ? "bg-gradient-to-br from-amber-300 to-orange-400" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            } ${c.matched ? "opacity-60" : ""}`}>
            {c.flipped || c.matched ? c.v : "?"}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-3">
        <Coins className="h-3 w-3" /> Fewer moves = bigger reward
      </div>
    </div>
  );
}
