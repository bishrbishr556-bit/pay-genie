import { ArrowLeft, ImageIcon, Zap, ZapOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";
import { toast } from "sonner";

function parseUpi(raw: string): string | null {
  const t = raw.trim();
  if (t.toLowerCase().startsWith("upi://")) {
    try {
      const u = new URL(t);
      const pa = u.searchParams.get("pa");
      if (pa && pa.includes("@")) return pa;
    } catch { /* ignore */ }
  }
  if (/^[\w.\-+]+@[\w.\-]+$/.test(t)) return t;
  return null;
}

export function ScannerScreen({ onBack, onScanned }: { onBack: () => void; onScanned: (upi: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [status, setStatus] = useState<"starting" | "scanning" | "denied" | "unsupported">("starting");
  const [flashOn, setFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);

  const handleResult = (upi: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    playSuccess(); vibrate([40, 30, 80]);
    toast.success(`QR detected: ${upi}`);
    setTimeout(() => onScanned(upi), 400);
  };

  // Boot camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) { setStatus("unsupported"); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        const track = stream.getVideoTracks()[0];
        const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
        setFlashSupported(!!caps.torch);
        setStatus("scanning");
        loop();
      } catch {
        setStatus("denied");
      }
    }
    function loop() {
      const v = videoRef.current; const c = canvasRef.current;
      if (!v || !c || doneRef.current) return;
      if (v.readyState === v.HAVE_ENOUGH_DATA) {
        const w = v.videoWidth, h = v.videoHeight;
        if (w && h) {
          c.width = w; c.height = h;
          const ctx = c.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(v, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
          if (code?.data) {
            const upi = parseUpi(code.data);
            if (upi) { handleResult(upi); return; }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !flashOn;
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet & { torch: boolean }] });
      setFlashOn(next);
      playClick(); vibrate(15);
    } catch {
      toast.error("Flash not available");
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    playClick();
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(data.data, c.width, c.height);
      if (code?.data) {
        const upi = parseUpi(code.data);
        if (upi) { handleResult(upi); return; }
      }
      toast.error("No UPI QR found in image");
    };
    img.src = URL.createObjectURL(f);
  };

  const simulate = () => handleResult("anas@okbank");

  return (
    <div className="h-full bg-slate-950 text-white relative overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-black/40" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-12 pb-4 flex items-center gap-3 z-20">
        <button
          onClick={() => { playClick(); vibrate(15); onBack(); }}
          className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="flex-1 font-bold text-lg">Scan QR</h2>
        {flashSupported && (
          <button
            onClick={toggleFlash}
            className={`h-10 w-10 rounded-full backdrop-blur flex items-center justify-center active:scale-90 ${flashOn ? "bg-amber-500" : "bg-black/50"}`}
            aria-label="Toggle flash"
          >
            {flashOn ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          </button>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90"
          aria-label="Upload from gallery"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
      </div>

      {/* Frame */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative h-64 w-64 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl" />
          <motion.div
            animate={{ y: [0, 240, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-2 right-2 h-1 bg-emerald-400 shadow-[0_0_12px_2px] shadow-emerald-400"
          />
        </div>
      </div>

      {/* Bottom area */}
      <div className="absolute bottom-28 left-0 right-0 px-5 text-center space-y-3 z-20">
        {status === "starting" && (
          <p className="text-sm opacity-90 inline-flex items-center gap-2 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
          </p>
        )}
        {status === "scanning" && <p className="text-sm opacity-90">Align QR code within frame</p>}
        {status === "denied" && (
          <div className="space-y-2">
            <p className="text-sm text-amber-300">Camera permission denied</p>
            <p className="text-[11px] opacity-80">Use the gallery icon to upload a QR image instead.</p>
          </div>
        )}
        {status === "unsupported" && (
          <p className="text-sm text-amber-300">Camera not supported in this browser</p>
        )}
        <button
          onClick={simulate}
          className="bg-white/90 text-slate-900 font-semibold px-5 py-2.5 rounded-full active:scale-95 text-sm"
        >
          Demo: scan anas@okbank
        </button>
      </div>
    </div>
  );
}