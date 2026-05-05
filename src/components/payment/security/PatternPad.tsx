import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { playClick, vibrate } from "@/lib/payment-store";

export function PatternPad({
  onComplete,
  shake = false,
}: {
  onComplete: (pattern: string) => void;
  shake?: boolean;
}) {
  const [path, setPath] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dotPositions = useRef<Record<number, { x: number; y: number }>>({});

  const setDotRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (!el || !ref.current) return;
    const r = el.getBoundingClientRect();
    const p = ref.current.getBoundingClientRect();
    dotPositions.current[i] = { x: r.left + r.width / 2 - p.left, y: r.top + r.height / 2 - p.top };
  }, []);

  const handleMove = (clientX: number, clientY: number) => {
    if (!drawing || !ref.current) return;
    const p = ref.current.getBoundingClientRect();
    const x = clientX - p.left;
    const y = clientY - p.top;
    setPointer({ x, y });
    for (let i = 0; i < 9; i++) {
      const d = dotPositions.current[i];
      if (!d) continue;
      const dx = x - d.x, dy = y - d.y;
      if (Math.sqrt(dx*dx + dy*dy) < 26 && !path.includes(i)) {
        playClick(); vibrate(8);
        setPath((p) => [...p, i]);
      }
    }
  };

  const start = (i: number) => {
    setPath([i]);
    setDrawing(true);
    vibrate(8); playClick();
  };

  const end = () => {
    setDrawing(false);
    setPointer(null);
    if (path.length >= 4) {
      onComplete(path.join("-"));
      setTimeout(() => setPath([]), 200);
    } else if (path.length > 0) {
      setTimeout(() => setPath([]), 400);
    }
  };

  return (
    <motion.div
      ref={ref}
      animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
      className="relative mx-auto h-[280px] w-[280px] touch-none select-none"
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchMove={(e) => { const t = e.touches[0]; handleMove(t.clientX, t.clientY); }}
      onTouchEnd={end}
    >
      {/* SVG lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {path.length > 1 && path.slice(0, -1).map((p, idx) => {
          const a = dotPositions.current[p];
          const b = dotPositions.current[path[idx + 1]];
          if (!a || !b) return null;
          return <line key={idx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(96 165 250)" strokeWidth={4} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgb(96 165 250))" }} />;
        })}
        {drawing && pointer && path.length > 0 && (() => {
          const a = dotPositions.current[path[path.length - 1]];
          if (!a) return null;
          return <line x1={a.x} y1={a.y} x2={pointer.x} y2={pointer.y} stroke="rgb(96 165 250)" strokeWidth={4} strokeLinecap="round" opacity={0.7} />;
        })()}
      </svg>
      {/* Dots */}
      <div className="grid grid-cols-3 gap-0 h-full w-full">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div
              ref={setDotRef(i)}
              onMouseDown={() => start(i)}
              onTouchStart={() => start(i)}
              className="relative h-14 w-14 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: path.includes(i) ? 1.4 : 1 }}
                className={`h-4 w-4 rounded-full ${
                  path.includes(i)
                    ? "bg-blue-400 shadow-lg shadow-blue-400/60"
                    : "bg-white/30"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
