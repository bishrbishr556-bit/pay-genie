import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle, Send, MoreHorizontal, Users } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { toast } from "sonner";

export function ShareScreen({ onBack }: { onBack: () => void }) {
  const handleShare = (platform: string) => {
    playClick();
    vibrate(15);
    playSuccess();
    toast.success(`Sharing via ${platform}...`);
  };

  return (
    <div className="h-full overflow-y-auto bg-white text-slate-900 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={() => {
              playClick();
              vibrate(15);
              onBack();
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold pr-9 text-slate-800">Share App</h1>
        </div>
      </div>

      {/* Share Illustration */}
      <div className="px-4 pt-12 pb-8 text-center">
        <p className="text-base text-slate-600 font-medium mb-8">
          Share the app with your friends
        </p>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block mb-8"
        >
          {/* User Icons Illustration */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50" />
            
            {/* Center User Icon (Large) */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <Users className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            {/* Top User Icon */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-8 left-1/2 -translate-x-1/2"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            {/* Top Right User Icon */}
            <motion.div
              animate={{ 
                x: [0, 8, 0],
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
              className="absolute top-16 right-12"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            {/* Left User Icon */}
            <motion.div
              animate={{ 
                x: [0, -8, 0],
              }}
              transition={{ 
                duration: 2.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
              className="absolute top-1/2 left-8 -translate-y-1/2"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            {/* Right User Icon */}
            <motion.div
              animate={{ 
                x: [0, 8, 0],
              }}
              transition={{ 
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9
              }}
              className="absolute top-1/2 right-8 -translate-y-1/2"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            {/* Bottom User Icon */}
            <motion.div
              animate={{ 
                y: [0, 8, 0],
              }}
              transition={{ 
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Share via */}
      <div className="px-6">
        <p className="text-sm text-slate-500 mb-4">Share via</p>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleShare("WhatsApp")}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" fill="white" />
            </div>
            <span className="text-xs font-medium text-slate-700">WhatsApp</span>
          </button>

          <button
            onClick={() => handleShare("Telegram")}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Send className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">Telegram</span>
          </button>

          <button
            onClick={() => handleShare("More")}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
              <MoreHorizontal className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
