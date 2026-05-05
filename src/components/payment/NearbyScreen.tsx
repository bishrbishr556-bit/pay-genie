import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Navigation } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

const NEARBY_USERS = [
  { id: 1, name: "Rahim", avatar: "R", distance: "20 m", color: "from-blue-500 to-indigo-600", mapColor: "bg-blue-500" },
  { id: 2, name: "Anas", avatar: "A", distance: "35 m", color: "from-emerald-500 to-teal-600", mapColor: "bg-emerald-500" },
  { id: 3, name: "Fasil", avatar: "F", distance: "50 m", color: "from-pink-500 to-rose-600", mapColor: "bg-rose-500" },
  { id: 4, name: "Salim", avatar: "S", distance: "80 m", color: "from-orange-500 to-amber-600", mapColor: "bg-purple-500" },
];

export function NearbyScreen({ onBack }: { onBack: () => void }) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const handleUserClick = (userId: number) => {
    playClick();
    vibrate(15);
    setSelectedUser(userId);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={() => {
              playClick();
              vibrate(15);
              onBack();
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-9">Nearby Users</h1>
        </div>
      </div>

      {/* Map View */}
      <div className="px-4 pt-4">
        <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
          {/* Map Background - Simulated with pattern */}
          <div className="absolute inset-0 bg-slate-200">
            {/* Grid pattern to simulate map */}
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            
            {/* Street lines */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white/40"></div>
              <div className="absolute top-3/4 left-0 right-0 h-1 bg-white/30"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-white/30"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-white/40"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-white/30"></div>
            </div>
          </div>

          {/* Location Pins */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-[20%] left-[30%] z-10"
          >
            <div className="relative">
              <MapPin className="h-10 w-10 text-emerald-500 fill-emerald-500 drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-emerald-500/50 blur-sm"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-[50%] left-[55%] z-10"
          >
            <div className="relative">
              <MapPin className="h-10 w-10 text-rose-500 fill-rose-500 drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-rose-500/50 blur-sm"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-[65%] left-[75%] z-10"
          >
            <div className="relative">
              <MapPin className="h-10 w-10 text-purple-500 fill-purple-500 drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-purple-500/50 blur-sm"></div>
            </div>
          </motion.div>

          {/* Current Location (You) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
            </motion.div>
          </div>

          {/* Locate Me Button */}
          <button
            onClick={() => {
              playClick();
              vibrate(10);
            }}
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center active:scale-90 transition"
          >
            <Navigation className="h-5 w-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Nearby Users List */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Nearby Users</h3>
          <span className="text-xs text-slate-400">{NEARBY_USERS.length} users found</span>
        </div>

        <div className="space-y-2">
          {NEARBY_USERS.map((user, index) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleUserClick(user.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                selectedUser === user.id
                  ? "bg-blue-500/20 border-2 border-blue-500"
                  : "bg-slate-900 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg`}>
                {user.avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <p className="text-xs text-slate-400">{user.distance} away</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Distance</p>
                <p className="text-sm font-bold text-blue-400">{user.distance}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      {selectedUser && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 left-0 right-0 px-4"
        >
          <button
            onClick={() => {
              playClick();
              vibrate(15);
            }}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold shadow-lg active:scale-[0.98] transition"
          >
            Pay {NEARBY_USERS.find((u) => u.id === selectedUser)?.name}
          </button>
        </motion.div>
      )}

      {/* Info Banner */}
      <div className="px-4 mt-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3">
          <p className="text-xs text-blue-300 text-center">
            📍 Location services enabled. Showing users within 100m radius.
          </p>
        </div>
      </div>
    </div>
  );
}
