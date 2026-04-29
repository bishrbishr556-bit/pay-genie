import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BadgeCheck, ShieldCheck, CreditCard, Lock, EyeOff, Bell,
  Palette, Globe, HelpCircle, Users, Activity, Smartphone, Trash2, Store, Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { actions, playClick, vibrate } from "@/lib/payment-store";

type Row = { icon: LucideIcon; label: string; sub: string; tint: string; onClick?: () => void; danger?: boolean };
type Section = { title: string; rows: Row[] };

export function ProfileScreen({ onMerchant, onSoundbox }: { onMerchant: () => void; onSoundbox: () => void }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    if (saved) document.documentElement.classList.add("dark");
  }, []);
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    playClick(); vibrate(15);
  };

  const tap = (fn?: () => void) => () => { playClick(); vibrate(15); fn?.(); };

  const sections: Section[] = [
    {
      title: "Account & Security",
      rows: [
        { icon: BadgeCheck, label: "Profile Verification", sub: "Verify your identity", tint: "from-emerald-500 to-teal-600" },
        { icon: CreditCard, label: "UPI & Payment Settings", sub: "Manage UPI ID, linked accounts & limits", tint: "from-violet-500 to-purple-600" },
        { icon: ShieldCheck, label: "Security Center", sub: "Manage PIN, biometric & security", tint: "from-blue-500 to-sky-600" },
        { icon: EyeOff, label: "Privacy Controls", sub: "Control who can see your information", tint: "from-cyan-500 to-teal-600" },
        { icon: Bell, label: "Notification Settings", sub: "Customize alerts & notifications", tint: "from-amber-500 to-orange-500" },
      ],
    },
    {
      title: "Preferences",
      rows: [
        { icon: Palette, label: dark ? "Theme: Dark" : "Theme & Appearance", sub: "Choose app theme & display mode", tint: "from-pink-500 to-rose-600", onClick: toggleDark },
        { icon: Globe, label: "Language", sub: "Select your preferred language", tint: "from-blue-500 to-indigo-600" },
      ],
    },
    {
      title: "Modes",
      rows: [
        { icon: Store, label: "Merchant Mode", sub: "Accept payments as a shop", tint: "from-emerald-500 to-green-600", onClick: onMerchant },
        { icon: Volume2, label: "Sound Box", sub: "Voice alerts for received payments", tint: "from-sky-500 to-blue-600", onClick: onSoundbox },
      ],
    },
    {
      title: "Support & More",
      rows: [
        { icon: HelpCircle, label: "Help & Support", sub: "Get help, FAQs and contact support", tint: "from-amber-500 to-yellow-500" },
        { icon: Users, label: "Refer & Earn", sub: "Invite friends and earn rewards", tint: "from-emerald-500 to-teal-600" },
        { icon: Activity, label: "Account Activity", sub: "View recent logins & account activity", tint: "from-rose-500 to-red-500" },
        { icon: Smartphone, label: "Manage Devices", sub: "Manage devices linked to your account", tint: "from-slate-500 to-slate-700" },
        { icon: Trash2, label: "Delete Account", sub: "Permanently delete your account", tint: "from-red-500 to-rose-700", danger: true },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/85 backdrop-blur px-4 pt-3 pb-3 flex items-center">
        <button
          onClick={tap(() => actions.lock())}
          className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold pr-9">Profile Settings</h1>
      </div>

      {/* User card */}
      <div className="px-4 mt-1">
        <motion.button
          onClick={tap()}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] truncate">User Name</p>
            <p className="text-xs text-slate-400">+91 98765 43210</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </motion.button>
      </div>

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.title} className="mt-6 px-4">
          <h2 className="text-[11px] font-bold tracking-[0.12em] text-slate-400 mb-2 px-1">
            {sec.title.toUpperCase()}
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
            {sec.rows.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.label}
                  onClick={tap(r.onClick)}
                  className="w-full flex items-center gap-3 p-3.5 active:bg-slate-800/60 transition-colors text-left"
                >
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${r.tint} flex items-center justify-center shadow`}>
                    <Icon className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold ${r.danger ? "text-red-400" : "text-slate-100"}`}>{r.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{r.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-center text-[10px] text-slate-600 mt-6">GPay Clone · v1.0.0</p>
    </div>
  );
}
