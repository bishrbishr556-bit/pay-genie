import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import {
  Send, QrCode, Users as UsersIcon, AtSign, Smartphone, Tv, Lightbulb, Droplet, Flame, CreditCard,
  PhoneCall, Wifi, Cylinder, Calculator, Building2,
  Building, FileText, CreditCard as CardIcon, Banknote, PiggyBank, TrendingUp, Coins, Shield, HandCoins,
  Gift, Tag, BadgePercent, Crown, Heart, GraduationCap, Stethoscope, Bus, Plane, Hotel, Car, PlayCircle,
  User, ShieldCheck, Bell, HelpCircle, Languages, Palette, Fingerprint, LogOut, MessageSquareText, Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, vibrate } from "@/lib/payment-store";
import type { MoreOptionId } from "./MoreOptionsSheet";

type Item = { id: MoreOptionId; label: string; icon: LucideIcon; color: string };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "PAYMENTS",
    items: [
      { id: "send",        label: "Send Money",          icon: Send,       color: "from-emerald-500 to-green-600" },
      { id: "scan",        label: "Scan & Pay",          icon: QrCode,     color: "from-blue-500 to-indigo-600" },
      { id: "pay-contact", label: "Pay Contact",         icon: UsersIcon,  color: "from-orange-500 to-amber-600" },
      { id: "upi-id",      label: "UPI ID",              icon: AtSign,     color: "from-fuchsia-500 to-purple-600" },
      { id: "recharge",    label: "Mobile Recharge",     icon: Smartphone, color: "from-blue-500 to-cyan-600" },
      { id: "dth",         label: "DTH Recharge",        icon: Tv,         color: "from-violet-500 to-purple-700" },
      { id: "bills",       label: "Electricity Bill",    icon: Lightbulb,  color: "from-amber-400 to-orange-500" },
      { id: "water",       label: "Water Bill",          icon: Droplet,    color: "from-sky-500 to-blue-600" },
      { id: "gas",         label: "Gas Booking",         icon: Flame,      color: "from-pink-500 to-rose-600" },
      { id: "cc-payment",  label: "Credit Card Payment", icon: CreditCard, color: "from-orange-500 to-red-600" },
      { id: "landline",    label: "Landline Bill",       icon: PhoneCall,  color: "from-teal-500 to-cyan-700" },
      { id: "broadband",   label: "Broadband Bill",      icon: Wifi,       color: "from-blue-500 to-indigo-700" },
      { id: "cylinder",    label: "Cylinder Booking",    icon: Cylinder,   color: "from-rose-500 to-red-600" },
      { id: "tax",         label: "Tax Payment",         icon: Calculator, color: "from-emerald-500 to-green-700" },
      { id: "municipal",   label: "Municipal Tax",       icon: Building2,  color: "from-violet-500 to-purple-700" },
    ],
  },
  {
    title: "BANKING SERVICES",
    items: [
      { id: "check-balance",     label: "Check Bank Balance", icon: Building,    color: "from-emerald-500 to-teal-600" },
      { id: "bank-statement",    label: "Bank Statement",     icon: FileText,    color: "from-blue-500 to-indigo-600" },
      { id: "debit-card",        label: "Debit Card Services",icon: CardIcon,    color: "from-violet-500 to-purple-700" },
      { id: "add-bank",          label: "Add Bank Account",   icon: Banknote,    color: "from-amber-500 to-orange-600" },
      { id: "fixed-deposit",     label: "Fixed Deposit",      icon: PiggyBank,   color: "from-blue-600 to-sky-700" },
      { id: "recurring-deposit", label: "Recurring Deposit",  icon: PiggyBank,   color: "from-pink-500 to-rose-600" },
      { id: "mutual-funds",      label: "Mutual Funds",       icon: TrendingUp,  color: "from-emerald-500 to-teal-600" },
      { id: "gold-investment",   label: "Gold Investment",    icon: Coins,       color: "from-amber-400 to-yellow-600" },
      { id: "insurance",         label: "Insurance",          icon: Shield,      color: "from-blue-500 to-cyan-600" },
      { id: "loan-repayment",    label: "Loan Repayment",     icon: HandCoins,   color: "from-violet-500 to-purple-700" },
    ],
  },
  {
    title: "MORE SERVICES",
    items: [
      { id: "rewards",         label: "Rewards",         icon: Gift,         color: "from-orange-500 to-red-500" },
      { id: "coupons",         label: "Coupons",         icon: Tag,          color: "from-pink-500 to-rose-600" },
      { id: "offers",          label: "Offers",          icon: BadgePercent, color: "from-emerald-500 to-green-600" },
      { id: "cashback-points", label: "Cashback Points", icon: Coins,        color: "from-amber-400 to-orange-500" },
      { id: "vip-benefits",    label: "VIP Benefits",    icon: Crown,        color: "from-violet-500 to-purple-700" },
      { id: "charity",         label: "Charity",         icon: Heart,        color: "from-blue-500 to-cyan-600" },
      { id: "education",       label: "Education Fees",  icon: GraduationCap,color: "from-blue-500 to-indigo-600" },
      { id: "hospital",        label: "Hospital Bills",  icon: Stethoscope,  color: "from-violet-500 to-purple-600" },
      { id: "travel",          label: "Travel Booking",  icon: Bus,          color: "from-orange-500 to-amber-600" },
      { id: "flight",          label: "Flight Booking",  icon: Plane,        color: "from-emerald-500 to-green-600" },
      { id: "bus",             label: "Bus Booking",     icon: Bus,          color: "from-pink-500 to-rose-600" },
      { id: "hotel",           label: "Hotel Booking",   icon: Hotel,        color: "from-teal-500 to-cyan-700" },
      { id: "movies",          label: "Movie Tickets",   icon: PlayCircle,   color: "from-rose-500 to-red-600" },
      { id: "fastag",          label: "FASTag Recharge", icon: Car,          color: "from-blue-500 to-cyan-700" },
      { id: "google-play",     label: "Google Play Recharge", icon: PlayCircle, color: "from-fuchsia-500 to-purple-700" },
    ],
  },
  {
    title: "PROFILE & SETTINGS",
    items: [
      { id: "account",       label: "My Profile",            icon: User,        color: "from-blue-500 to-indigo-600" },
      { id: "security",      label: "Security Settings",     icon: ShieldCheck, color: "from-emerald-500 to-green-600" },
      { id: "notifications", label: "Notification Settings", icon: Bell,        color: "from-amber-500 to-orange-600" },
      { id: "help",          label: "Help & Support",        icon: HelpCircle,  color: "from-blue-500 to-cyan-600" },
      { id: "language",      label: "Language Settings",     icon: Languages,   color: "from-violet-500 to-purple-700" },
      { id: "theme",         label: "Theme",                 icon: Palette,     color: "from-pink-500 to-rose-600" },
      { id: "biometric",     label: "Biometric Settings",    icon: Fingerprint, color: "from-emerald-500 to-teal-600" },
      { id: "logout",        label: "Logout",                icon: LogOut,      color: "from-blue-500 to-indigo-600" },
      { id: "feedback",      label: "Feedback",              icon: MessageSquareText, color: "from-orange-500 to-red-500" },
      { id: "about",         label: "About Us",              icon: Info,        color: "from-teal-500 to-cyan-600" },
    ],
  },
];

export function AllServicesScreen({ onBack, onPick }: { onBack: () => void; onPick: (id: MoreOptionId) => void }) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return SECTIONS;
    return SECTIONS.map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(ql)) }))
      .filter((s) => s.items.length > 0);
  }, [q]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="px-5 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => { playClick(); vibrate(15); onBack(); }} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold flex-1">All Services</h1>
        <div className="relative w-44">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search Services"
            className="w-full bg-slate-800/80 text-xs rounded-full pl-8 pr-3 py-2 outline-none focus:ring-2 ring-violet-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-24 space-y-3">
        {filtered.map((sec) => {
          const isCollapsed = collapsed[sec.title];
          return (
            <div key={sec.title} className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold tracking-widest text-slate-300">{sec.title}</h2>
                <button
                  onClick={() => { playClick(); setCollapsed((c) => ({ ...c, [sec.title]: !c[sec.title] })); }}
                  className="text-[11px] font-semibold text-fuchsia-400"
                >
                  {isCollapsed ? "View All ›" : "View Less ⌃"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-5 gap-3">
                      {sec.items.map((it) => {
                        const Icon = it.icon;
                        return (
                          <button
                            key={it.id}
                            onClick={() => { playClick(); vibrate(15); onPick(it.id); }}
                            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                          >
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center shadow-lg`}>
                              <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                            </div>
                            <span className="text-[10px] font-medium text-center leading-tight text-slate-200">{it.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-10">No services match "{q}"</div>
        )}
      </div>
    </div>
  );
}