import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle, Mail, MoreHorizontal } from "lucide-react";
import { playClick, vibrate, playSuccess } from "@/lib/payment-store";
import { toast } from "sonner";

export function InviteScreen({ onBack }: { onBack: () => void }) {
  const handleInvite = (method: string) => {
    playClick();
    vibrate(15);
    toast.success(`Opening ${method}...`);
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
          <h1 className="flex-1 text-center text-lg font-bold pr-9 text-slate-800">Invite Friends</h1>
        </div>
      </div>

      {/* Gift Illustration */}
      <div className="px-4 pt-12 pb-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block mb-6"
        >
          {/* Gift Box with confetti */}
          <div className="relative">
            {/* Confetti particles */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -left-4 text-2xl"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -10, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
              className="absolute -top-6 right-0 text-xl"
            >
              🎉
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 15, 0]
              }}
              transition={{ 
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
              className="absolute top-2 -right-6 text-lg"
            >
              🎊
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, -15, 0]
              }}
              transition={{ 
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9
              }}
              className="absolute -bottom-2 -left-6 text-lg"
            >
              ⭐
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 12, 0]
              }}
              transition={{ 
                duration: 2.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute bottom-4 -right-4 text-xl"
            >
              💫
            </motion.div>
            
            {/* Gift Box */}
            <div className="text-9xl">🎁</div>
          </div>
        </motion.div>
        
        <p className="text-base text-slate-600 font-medium">
          Invite your friends & earn rewards
        </p>
      </div>

      {/* Invite Button */}
      <div className="px-6 mb-8">
        <button
          onClick={() => {
            playClick();
            vibrate(15);
            playSuccess();
            toast.success("Invite link copied!");
          }}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg text-white shadow-lg active:scale-[0.98] transition"
        >
          Invite Now
        </button>
      </div>

      {/* Share via */}
      <div className="px-6">
        <p className="text-sm text-slate-500 mb-4">Share via</p>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleInvite("WhatsApp")}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" fill="white" />
            </div>
            <span className="text-xs font-medium text-slate-700">WhatsApp</span>
          </button>

          <button
            onClick={() => handleInvite("SMS")}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" fill="white" />
            </div>
            <span className="text-xs font-medium text-slate-700">SMS</span>
          </button>

          <button
            onClick={() => handleInvite("More")}
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
