import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, RotateCw, Phone } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

type CallState = "connecting" | "connected";

export function VideoCallScreen({ onBack }: { onBack: () => void }) {
  const [callState, setCallState] = useState<CallState>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [duration, setDuration] = useState(0);

  // Simulate call connecting after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState("connected");
      vibrate([20, 30, 20]);
    }, 2000);

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

  const handleCamera = () => {
    playClick();
    vibrate(10);
    setIsCameraOff(!isCameraOff);
  };

  const handleFlip = () => {
    playClick();
    vibrate(10);
  };

  const handleEndCall = () => {
    playClick();
    vibrate(20);
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Main Video Feed (Remote User) */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
        {/* Simulated video feed with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/60" />
        
        {/* Placeholder for video - showing a person silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {callState === "connecting" ? (
              <div className="space-y-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-bold text-white text-4xl">
                  R
                </div>
                <p className="text-lg text-slate-300">Connecting...</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* Simulated video feed - gradient background representing video */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                <div className="relative z-10 text-center">
                  <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-bold text-white text-5xl mb-4">
                    R
                  </div>
                  <p className="text-xl font-semibold">Rahim</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Duration Timer (top-left) */}
        {callState === "connected" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full"
          >
            <p className="text-sm font-semibold text-emerald-400">{formatDuration(duration)}</p>
          </motion.div>
        )}

        {/* Self View (Small window - top-right) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="absolute top-4 right-4 w-24 h-32 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl"
        >
          {isCameraOff ? (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-slate-500" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white text-lg">
                Y
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-20 pb-8 px-6">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleMute}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition shadow-lg ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-300"
              } active:scale-90`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <span className="text-xs text-slate-400">Mute</span>
          </div>

          {/* Camera Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleCamera}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition shadow-lg ${
                isCameraOff
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-300"
              } active:scale-90`}
            >
              {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
            <span className="text-xs text-slate-400">Camera</span>
          </div>

          {/* Flip Camera Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleFlip}
              className="h-14 w-14 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center active:scale-90 transition shadow-lg"
            >
              <RotateCw className="h-6 w-6" />
            </button>
            <span className="text-xs text-slate-400">Flip</span>
          </div>

          {/* End Call Button */}
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/40"
            >
              <Phone className="h-6 w-6 text-white rotate-[135deg]" strokeWidth={2.5} />
            </motion.button>
            <span className="text-xs text-slate-400">End</span>
          </div>
        </div>
      </div>
    </div>
  );
}
