import { useStore, playClick, vibrate } from "@/lib/payment-store";
import { Bell, Wifi, WifiOff, QrCode, Send, Smartphone, Zap, Tv, Droplet, Gift, TrendingUp, Store, Sparkles } from "lucide-react";
import type { Tab } from "./BottomNav";

export function HomeScreen({ onNavigate, online, onInstall, canInstall }: { onNavigate: (t: Tab | "soundbox" | "merchant" | "scanner") => void; online: boolean; onInstall: () => void; canInstall: boolean }) {
  const balance = useStore((s) => s.balance);
  const cashback = useStore((s) => s.cashback);
  const txns = useStore((s) => s.txns);

  return (
    <div className="pb-24 overflow-y-auto h-full">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-3xl shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold">
              U
            </div>
            <div>
              <p className="text-xs opacity-80">Hello,</p>
              <p className="font-semibold text-sm">User</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-yellow-200" />}
            <Bell className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs opacity-80 mb-1">Available balance</p>
        <p className="text-4xl font-bold tracking-tight">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        <p className="text-xs opacity-70 mt-1">A/c XX1234 · HDFC Bank</p>
      </div>

      {/* Quick actions */}
      <div className="px-5 -mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
          <QuickAction icon={Send} label="Send" color="bg-blue-500" onClick={() => onNavigate("pay")} />
          <QuickAction icon={QrCode} label="Scan" color="bg-purple-500" onClick={() => onNavigate("scanner")} />
          <QuickAction icon={Store} label="Merchant" color="bg-orange-500" onClick={() => onNavigate("merchant")} />
          <QuickAction icon={Sparkles} label="SoundBox" color="bg-pink-500" onClick={() => onNavigate("soundbox")} />
        </div>
      </div>

      {/* Install banner */}
      {canInstall && (
        <div className="mx-5 mt-4 gradient-reward text-white rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs opacity-90">Add to home screen for native experience</p>
          </div>
          <button
            onClick={() => {
              playClick();
              vibrate(20);
              onInstall();
            }}
            className="bg-white text-purple-700 text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform"
          >
            Install
          </button>
        </div>
      )}

      {/* Rewards banner */}
      <button
        onClick={() => onNavigate("rewards")}
        className="mx-5 mt-4 w-[calc(100%-2.5rem)] gradient-gold text-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform"
      >
        <Gift className="h-8 w-8" />
        <div className="text-left flex-1">
          <p className="font-bold text-sm">You've earned ₹{cashback} cashback!</p>
          <p className="text-xs opacity-80">Tap to scratch & spin →</p>
        </div>
      </button>

      {/* Bills */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Bills & Recharge</h3>
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
          <QuickAction icon={Smartphone} label="Mobile" color="bg-emerald-500" />
          <QuickAction icon={Zap} label="Electric" color="bg-amber-500" />
          <QuickAction icon={Tv} label="DTH" color="bg-rose-500" />
          <QuickAction icon={Droplet} label="Water" color="bg-sky-500" />
        </div>
      </div>

      {/* Smart suggestions */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-semibold mb-3 text-foreground">For you</h3>
        <div className="space-y-2">
          <SuggestCard icon="💸" title="Send to Rahim" sub="You sent ₹500 last week" />
          <SuggestCard icon="📱" title="Recharge due soon" sub="Airtel prepaid · expires in 3 days" />
          <SuggestCard icon="🎁" title="₹1000 cashback offer" sub="On bill payments above ₹500" />
        </div>
      </div>

      {/* Recent */}
      {txns.length > 0 && (
        <div className="px-5 mt-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
            <TrendingUp className="h-4 w-4" /> Recent activity
          </h3>
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
            {txns.slice(0, 3).map((t) => (
              <div key={t.id} className="p-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-white ${t.type === "received" ? "bg-emerald-500" : "bg-rose-500"}`}>
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.ts).toLocaleString()}</p>
                </div>
                <p className={`font-semibold text-sm ${t.type === "received" ? "text-emerald-600" : "text-foreground"}`}>
                  {t.type === "received" ? "+" : "-"}₹{t.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: typeof Send; label: string; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={() => {
        playClick();
        vibrate(15);
        onClick?.();
      }}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div className={`h-12 w-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium text-foreground">{label}</span>
    </button>
  );
}

function SuggestCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-3 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}