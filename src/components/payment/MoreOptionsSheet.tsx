import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Download, QrCode, Smartphone, Receipt, Building2, AtSign, UserCheck, ShieldCheck, Globe,
  CircleDot, Ticket, Gift, Gamepad2, Wallet, History, FileDown, BarChart3, PieChart, FileText,
  Building, CreditCard, Lock, Shield, User, Volume2, WifiOff, Tag, Users, UserPlus,
  Settings, Moon, Languages, Headphones, Info,
  Zap, RefreshCw, ShieldPlus, Coins, TrendingUp, Gauge, BadgePercent, HeartHandshake,
  Plane, Film, CalendarDays, Calculator, ArrowLeftRight, MapPin, BadgeCheck, Bell,
  Palette, Activity, Trash2, Store, EyeOff,
} from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";
import type { LucideIcon } from "lucide-react";

export type MoreOptionId =
  | "send" | "request" | "scan" | "recharge" | "bills" | "bank-transfer" | "upi-id" | "self" | "approve" | "intl"
  | "spin" | "scratch" | "mystery" | "play" | "wallet"
  | "history" | "receipt" | "analytics" | "spending" | "statement"
  | "add-bank" | "cards" | "change-pin" | "security" | "account"
  | "soundbox" | "offline" | "offers" | "refer" | "invite"
  | "settings" | "dark" | "language" | "help" | "about"
  | "voucher" | "upi-lite" | "autopay" | "insurance" | "gold" | "mutual-funds" | "credit-score"
  | "loan-offers" | "donations" | "travel" | "movies" | "events" | "emi" | "currency" | "nearby"
  | "verify" | "privacy" | "notifications" | "theme" | "activity" | "devices" | "delete-account" | "merchant";

type Item = { id: MoreOptionId; label: string; icon: LucideIcon; color: string };
type Section = { title: string; accent: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Payments", accent: "bg-blue-500",
    items: [
      { id: "send", label: "Send Money", icon: Send, color: "from-blue-500 to-blue-600" },
      { id: "request", label: "Request Money", icon: Download, color: "from-emerald-500 to-emerald-600" },
      { id: "scan", label: "Scan QR", icon: QrCode, color: "from-purple-500 to-purple-600" },
      { id: "recharge", label: "Mobile Recharge", icon: Smartphone, color: "from-sky-500 to-sky-600" },
      { id: "bills", label: "Pay Bills", icon: Receipt, color: "from-orange-500 to-orange-600" },
      { id: "bank-transfer", label: "Bank Transfer", icon: Building2, color: "from-teal-500 to-teal-600" },
      { id: "upi-id", label: "UPI ID", icon: AtSign, color: "from-pink-500 to-pink-600" },
      { id: "self", label: "Self Transfer", icon: UserCheck, color: "from-indigo-500 to-indigo-600" },
      { id: "approve", label: "Approve to Pay", icon: ShieldCheck, color: "from-amber-500 to-amber-600" },
      { id: "intl", label: "International", icon: Globe, color: "from-violet-500 to-violet-600" },
    ],
  },
  {
    title: "Rewards & Games", accent: "bg-pink-500",
    items: [
      { id: "spin", label: "Spin Wheel", icon: CircleDot, color: "from-fuchsia-500 to-purple-600" },
      { id: "scratch", label: "Scratch Cards", icon: Ticket, color: "from-blue-500 to-cyan-500" },
      { id: "mystery", label: "Mystery Box", icon: Gift, color: "from-amber-500 to-orange-500" },
      { id: "play", label: "Play & Earn", icon: Gamepad2, color: "from-emerald-500 to-green-600" },
      { id: "wallet", label: "Rewards Wallet", icon: Wallet, color: "from-rose-500 to-pink-600" },
    ],
  },
  {
    title: "Transactions", accent: "bg-emerald-500",
    items: [
      { id: "history", label: "History", icon: History, color: "from-emerald-500 to-teal-600" },
      { id: "receipt", label: "Download Receipt", icon: FileDown, color: "from-blue-500 to-indigo-600" },
      { id: "analytics", label: "Analytics", icon: BarChart3, color: "from-purple-500 to-violet-600" },
      { id: "spending", label: "Spending", icon: PieChart, color: "from-orange-500 to-red-500" },
      { id: "statement", label: "Statement", icon: FileText, color: "from-sky-500 to-blue-600" },
    ],
  },
  {
    title: "Bank & Account", accent: "bg-blue-500",
    items: [
      { id: "add-bank", label: "Add Bank", icon: Building, color: "from-violet-500 to-purple-600" },
      { id: "cards", label: "Manage Cards", icon: CreditCard, color: "from-emerald-500 to-green-600" },
      { id: "change-pin", label: "Change PIN", icon: Lock, color: "from-orange-500 to-amber-600" },
      { id: "security", label: "Security", icon: Shield, color: "from-blue-500 to-sky-600" },
      { id: "account", label: "Account", icon: User, color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    title: "Extra Features", accent: "bg-purple-500",
    items: [
      { id: "soundbox", label: "Sound Box", icon: Volume2, color: "from-blue-500 to-cyan-600" },
      { id: "offline", label: "Offline Pay", icon: WifiOff, color: "from-slate-500 to-slate-700" },
      { id: "offers", label: "Offers", icon: Tag, color: "from-pink-500 to-rose-600" },
      { id: "refer", label: "Refer & Earn", icon: Users, color: "from-purple-500 to-violet-600" },
      { id: "invite", label: "Invite Friends", icon: UserPlus, color: "from-orange-500 to-amber-600" },
    ],
  },
  {
    title: "App Settings", accent: "bg-amber-500",
    items: [
      { id: "settings", label: "Settings", icon: Settings, color: "from-slate-500 to-slate-700" },
      { id: "dark", label: "Dark Mode", icon: Moon, color: "from-indigo-500 to-blue-700" },
      { id: "language", label: "Language", icon: Languages, color: "from-blue-500 to-sky-600" },
      { id: "help", label: "Help & Support", icon: Headphones, color: "from-emerald-500 to-teal-600" },
      { id: "about", label: "About Us", icon: Info, color: "from-violet-500 to-purple-700" },
    ],
  },
  {
    title: "Finance & Investments", accent: "bg-emerald-500",
    items: [
      { id: "voucher", label: "Voucher Wallet", icon: Ticket, color: "from-blue-500 to-indigo-600" },
      { id: "upi-lite", label: "UPI Lite", icon: Zap, color: "from-emerald-500 to-green-600" },
      { id: "autopay", label: "AutoPay", icon: RefreshCw, color: "from-pink-500 to-rose-600" },
      { id: "insurance", label: "Insurance", icon: ShieldPlus, color: "from-violet-500 to-purple-600" },
      { id: "gold", label: "Gold & Silver", icon: Coins, color: "from-amber-500 to-yellow-600" },
      { id: "mutual-funds", label: "Mutual Funds", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
      { id: "credit-score", label: "Credit Score", icon: Gauge, color: "from-purple-500 to-pink-600" },
      { id: "loan-offers", label: "Loan Offers", icon: BadgePercent, color: "from-rose-500 to-red-600" },
      { id: "donations", label: "Donations", icon: HeartHandshake, color: "from-pink-500 to-rose-600" },
    ],
  },
  {
    title: "Lifestyle & Travel", accent: "bg-orange-500",
    items: [
      { id: "travel", label: "Travel Bookings", icon: Plane, color: "from-sky-500 to-blue-600" },
      { id: "movies", label: "Movie Tickets", icon: Film, color: "from-purple-500 to-violet-600" },
      { id: "events", label: "Event Bookings", icon: CalendarDays, color: "from-orange-500 to-amber-600" },
      { id: "emi", label: "EMI Calculator", icon: Calculator, color: "from-emerald-500 to-green-600" },
      { id: "currency", label: "Currency Converter", icon: ArrowLeftRight, color: "from-blue-500 to-cyan-600" },
      { id: "nearby", label: "Nearby Stores", icon: MapPin, color: "from-pink-500 to-rose-600" },
    ],
  },
  {
    title: "Profile & Privacy", accent: "bg-violet-500",
    items: [
      { id: "verify", label: "Verification", icon: BadgeCheck, color: "from-emerald-500 to-teal-600" },
      { id: "privacy", label: "Privacy", icon: EyeOff, color: "from-cyan-500 to-teal-600" },
      { id: "notifications", label: "Notifications", icon: Bell, color: "from-amber-500 to-orange-500" },
      { id: "theme", label: "Theme", icon: Palette, color: "from-pink-500 to-rose-600" },
      { id: "merchant", label: "Merchant Mode", icon: Store, color: "from-emerald-500 to-green-600" },
      { id: "activity", label: "Activity", icon: Activity, color: "from-rose-500 to-red-500" },
      { id: "devices", label: "Devices", icon: Smartphone, color: "from-slate-500 to-slate-700" },
      { id: "delete-account", label: "Delete Account", icon: Trash2, color: "from-red-500 to-rose-700" },
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.items.length, 0);

export function MoreOptionsSheet({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: MoreOptionId) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute left-0 right-0 bottom-0 top-12 z-50 bg-slate-900 text-slate-100 rounded-t-3xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-2 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-slate-700" />
              <span className="w-9" />
              <h2 className="text-lg font-bold">More Options</h2>
              <button
                aria-label="Close"
                onClick={() => { playClick(); vibrate(15); onClose(); }}
                className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {SECTIONS.map((sec) => (
                <div key={sec.title} className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-1 h-4 rounded-full ${sec.accent}`} />
                    <h3 className="text-sm font-semibold">{sec.title}</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sec.items.map((it) => {
                      const Icon = it.icon;
                      return (
                        <button
                          key={it.id}
                          onClick={() => { playClick(); vibrate(15); onPick(it.id); }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-slate-800/60 active:scale-90 transition-transform border border-slate-700/50"
                        >
                          <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                          </div>
                          <span className="text-[10px] font-medium text-center leading-tight text-slate-200">{it.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-slate-500 mt-6 pt-2 border-t border-slate-800">{TOTAL} Options</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}