import { useState, useRef, useEffect } from "react";
import { useStore, actions, playReward, playTick, vibrate, playClick } from "@/lib/payment-store";
import { Gift, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RewardsScreen({ openCardId, onClearOpenCard }: { openCardId: string | null; onClearOpenCard: () => void }) {
  const rewards = useStore((s) => s.rewards);
  const cashback = useStore((s) => s.cashback);
  const lastSpinDate = useStore((s) => s.lastSpinDate);
  const [activeCard, setActiveCard] = useState<string | null>(openCardId);
  const [showSpin, setShowSpin] = useState(false);

  useEffect(() => {
    if (openCardId) setActiveCard(openCardId);
  }, [openCardId]);

  const canSpin = lastSpinDate !== new Date().toDateString();
  const activeReward = rewards.find((r) => r.id === activeCard);

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="gradient-reward text-white px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6" />
          <h2 className="font-bold text-xl">Rewards</h2>
        </div>
        <p className="text-xs opacity-80">Total cashback earned</p>
        <p className="text-4xl font-bold">₹{cashback}</p>
      </div>

      <div className="px-5 mt-4">
        <button
          onClick={() => { playClick(); setShowSpin(true); }}
          className="w-full gradient-gold text-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-card active:scale-[0.98] transition-transform"
        >
          <div className="text-left">
            <p className="font-bold">🎡 Spin & Win</p>
            <p className="text-xs opacity-80">{canSpin ? "1 free spin available today" : "Come back tomorrow"}</p>
          </div>
          <span className="text-2xl">→</span>
        </button>
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3 text-foreground">Scratch Cards ({rewards.filter(r => !r.scratched).length})</h3>
        {rewards.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-muted-foreground text-sm shadow-card">
            <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
            Make a payment to earn scratch cards!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((r) => (
              <button
                key={r.id}
                onClick={() => { playClick(); setActiveCard(r.id); }}
                className={`aspect-[4/5] rounded-2xl p-4 flex flex-col justify-between shadow-card active:scale-95 transition-transform ${
                  r.scratched ? "bg-muted" : "gradient-reward text-white"
                }`}
              >
                <Gift className="h-6 w-6" />
                {r.scratched ? (
                  <div className="text-left">
                    <p className="text-xs opacity-70">Won</p>
                    <p className="font-bold text-lg">₹{r.amount}</p>
                  </div>
                ) : (
                  <div className="text-left">
                    <p className="text-xs opacity-90">Tap to</p>
                    <p className="font-bold">Scratch</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeReward && (
          <ScratchModal
            reward={activeReward}
            onClose={() => { setActiveCard(null); onClearOpenCard(); }}
          />
        )}
        {showSpin && (
          <SpinModal canSpin={canSpin} onClose={() => setShowSpin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScratchModal({ reward, onClose }: { reward: { id: string; amount: number; scratched: boolean }; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(reward.scratched);
  const drawing = useRef(false);

  useEffect(() => {
    if (reward.scratched) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const w = c.width;
    const h = c.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#a78bfa");
    grad.addColorStop(1, "#60a5fa");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "white";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch & Win", w / 2, h / 2 - 10);
    ctx.font = "16px sans-serif";
    ctx.fillText("✨ Use finger ✨", w / 2, h / 2 + 20);
  }, [reward.scratched]);

  const scratch = (x: number, y: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const rect = c.getBoundingClientRect();
    const px = ((x - rect.left) / rect.width) * c.width;
    const py = ((y - rect.top) / rect.height) * c.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(px, py, 25, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  };

  const checkReveal = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] === 0) cleared++;
    }
    if (cleared / (data.length / 40) > 0.4) reveal();
  };

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    actions.scratchReward(reward.id);
    playReward();
    vibrate([50, 30, 80]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        className="bg-card rounded-3xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden gradient-gold">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {reward.amount > 0 ? (
              <>
                <Sparkles className="h-10 w-10 text-slate-900 mb-2" />
                <p className="text-xs text-slate-700 font-semibold">YOU WON</p>
                <p className="text-5xl font-bold text-slate-900">₹{reward.amount}</p>
                <p className="text-xs text-slate-700 mt-1">Cashback</p>
              </>
            ) : (
              <>
                <p className="text-3xl">😅</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">Better luck</p>
                <p className="text-xs text-slate-700">next time</p>
              </>
            )}
          </div>
          {!reward.scratched && (
            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="absolute inset-0 w-full h-full touch-none cursor-pointer"
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
        {revealed && (
          <button onClick={onClose} className="mt-4 w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl">
            Collect ✨
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

function SpinModal({ canSpin, onClose }: { canSpin: boolean; onClose: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const segments = [5, 10, 20, 50, 100, 0, 10, 5];
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#6b7280", "#10b981", "#f59e0b"];

  const spin = () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    const { reward } = actions.spinWheel();
    const idx = segments.indexOf(reward);
    const segAngle = 360 / segments.length;
    const target = 360 * 5 + (360 - idx * segAngle - segAngle / 2);
    setRotation(target);
    const tickInterval = setInterval(() => playTick(), 100);
    setTimeout(() => {
      clearInterval(tickInterval);
      setResult(reward);
      setSpinning(false);
      playReward();
      vibrate([50, 30, 80]);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-card rounded-3xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg mb-1">Spin & Win</h3>
        <p className="text-xs text-muted-foreground mb-4">{canSpin ? "1 free spin today" : "Next spin tomorrow"}</p>
        <div className="relative w-64 h-64 mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-500" />
          </div>
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full rounded-full overflow-hidden shadow-elevated relative"
            style={{
              background: `conic-gradient(${segments
                .map((_, i) => `${colors[i]} ${(i * 100) / segments.length}% ${((i + 1) * 100) / segments.length}%`)
                .join(", ")})`,
            }}
          >
            {segments.map((s, i) => {
              const angle = (i * 360) / segments.length + 360 / segments.length / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 text-white font-bold text-xs"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-90px)`,
                    transformOrigin: "0 0",
                  }}
                >
                  {s === 0 ? "Try" : `₹${s}`}
                </div>
              );
            })}
          </motion.div>
          <button
            onClick={spin}
            disabled={!canSpin || spinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white text-slate-900 font-bold text-sm shadow-elevated active:scale-90 disabled:opacity-60 transition-transform"
          >
            SPIN
          </button>
        </div>
        {result !== null && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4">
            <p className="font-bold text-lg">
              {result > 0 ? `You won ₹${result}! 🎉` : "Better luck next time!"}
            </p>
            <p className="text-xs text-muted-foreground">Added as scratch card</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function RewardsHeader({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack}><ArrowLeft className="h-5 w-5" /></button>
  );
}