import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

const FAVORITES = [
  { id: 1, name: "Rahim", phone: "98765 43214", avatar: "R", color: "from-emerald-500 to-teal-600" },
  { id: 2, name: "Anas", phone: "98765 43210", avatar: "A", color: "from-blue-500 to-indigo-600" },
  { id: 3, name: "Fasil", phone: "98765 43212", avatar: "F", color: "from-pink-500 to-rose-600" },
  { id: 4, name: "Salim", phone: "98765 43215", avatar: "S", color: "from-cyan-500 to-sky-600" },
];

export function FavoritesScreen({ onBack }: { onBack: () => void }) {
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
          <h1 className="flex-1 text-center text-base font-bold pr-9">Favorites</h1>
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-4 pt-2">
        {FAVORITES.map((contact) => (
          <motion.button
            key={contact.id}
            onClick={() => {
              playClick();
              vibrate(10);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/50 active:bg-slate-900 transition-colors mb-2"
          >
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center font-bold text-white shrink-0`}>
              {contact.avatar}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">{contact.name}</p>
              <p className="text-xs text-slate-400">{contact.phone}</p>
            </div>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </motion.button>
        ))}
      </div>

      {/* Empty State if needed */}
      {FAVORITES.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 px-6">
          <Star className="h-16 w-16 text-slate-700 mb-4" />
          <p className="text-slate-400 text-center">No favorites yet</p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Star your frequent contacts to add them here
          </p>
        </div>
      )}
    </div>
  );
}
