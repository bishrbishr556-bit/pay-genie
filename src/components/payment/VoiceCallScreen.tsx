import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Grid3x3, Phone } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

type CallState = "calling" | "connected" | "ended";

export function VoiceCallScreen({ onBack }: { onBack: () => void }) {
  const [callState, setCallState] = useState<CallState>("calling");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [duration, setDuration] = useState(0);

  // Simulate call connecting after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState("connected");
      vibrate([20, 30, 20]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState === "connected") {
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMute = () => {
    playClick();
    vibrate(10);
    setIsMuted(!isMuted);
  };

  const handleSpeaker = () => {
    playClick();
    vibrate(10);
    setIsSpeaker(!isSpeaker);
  };

  const handleKeypad = () => {
    playClick();
    vibrate(10);
  };

  const handleEndCall = () => {
    playClick();
    vibrate(20);
    setCallState("ended");
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-slate-950 to-slate-950" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-12 px-6">
        {/* Top section - Avatar and status */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative mb-8"
          >
            {/* Pulsing rings for calling state */}
            {callState === "calling" && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-500/30"
                  style={{ width: "160px", height: "160px", left: "-20px", top: "-20px" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                  style={{ width: "180px", height: "180px", left: "-30px", top: "-30px" }}
                />
              </>
            )}

            {/* Avatar */}
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-5xl shadow-2xl">
              R
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-3"
          >
            Rahim
          </motion.h1>

          {/* Status */}
          <AnimatePresence mode="wait">
            {callState === "calling" && (
              <motion.p
                key="calling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg text-slate-400"
              >
                Calling...
              </motion.p>
            )}
            {callState === "connected" && (
              <motion.p
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-lg text-emerald-400 font-semibold"
              >
                {formatDuration(duration)}
              </motion.p>
            )}
            {callState === "ended" && (
              <motion.p
                key="ended"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-red-400"
              >
                Call Ended
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom section - Controls */}
        <div className="w-full space-y-8">
          {/* Control buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleMute}
              className={`h-16 w-16 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? "bg-red-500/20 text-red-400"
                  : "bg-slate-800 text-slate-300"
              } active:scale-90`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            <button
              onClick={handleSpeaker}
              className={`h-16 w-16 rounded-full flex items-center justify-center transition ${
                isSpeaker
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-300"
              } active:scale-90`}
            >
              {isSpeaker ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </button>

            <button
              onClick={handleKeypad}
              className="h-16 w-16 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center active:scale-90 transition"
            >
              <Grid3x3 className="h-6 w-6" />
            </button>
          </div>

          {/* Labels */}
          <div className="flex items-center justify-center gap-6">
            <span className="w-16 text-center text-xs text-slate-400">Mute</span>
            <span className="w-16 text-center text-xs text-slate-400">Speaker</span>
            <span className="w-16 text-center text-xs text-slate-400">Keypad</span>
          </div>

          {/* End call button */}
          <div className="flex justify-center pt-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/40"
            >
              <Phone className="h-6 w-6 text-white rotate-[135deg]" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
