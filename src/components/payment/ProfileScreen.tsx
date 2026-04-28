import { useStore, actions, playClick } from "@/lib/payment-store";
import { Moon, Sun, Languages, Lock, LogOut, CreditCard, Store, Volume2, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

export function ProfileScreen({ onMerchant, onSoundbox }: { onMerchant: () => void; onSoundbox: () => void }) {
  const balance = useStore((s) => s.balance);
  const txns = useStore((s) => s.txns);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<"en" | "ml">("en");

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
    playClick();
  };

  const monthSpent = txns.filter(t => t.type === "sent" && Date.now() - t.ts < 30 * 86400000).reduce((a, b) => a + b.amount, 0);
  const monthEarned = txns.filter(t => t.type === "received" && Date.now() - t.ts < 30 * 86400000).reduce((a, b) => a + b.amount, 0);

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="gradient-primary text-primary-foreground px-5 pt-12 pb-8 text-center">
        <div className="h-20 w-20 rounded-full bg-white/20 mx-auto flex items-center justify-center text-3xl font-bold backdrop-blur">
          U
        </div>
        <p className="font-bold mt-3">User</p>
        <p className="text-xs opacity-80">user@upi · +91 98XXX XXX12</p>
      </div>

      <div className="px-5 -mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Balance" value={`₹${balance.toLocaleString("en-IN")}`} />
          <Stat label="30d spent" value={`₹${monthSpent}`} />
          <Stat label="30d earned" value={`₹${monthEarned}`} />
        </div>
      </div>

      <div className="px-5 mt-6 space-y-2">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Modes</h3>
        <Row icon={Store} label="Merchant Mode" onClick={onMerchant} />
        <Row icon={Volume2} label="Sound Box (shop)" onClick={onSoundbox} />
        <Row icon={BarChart3} label="Analytics" />
      </div>

      <div className="px-5 mt-6 space-y-2">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Settings</h3>
        <Row icon={dark ? Sun : Moon} label={dark ? "Light mode" : "Dark mode"} onClick={toggleDark} />
        <Row
          icon={Languages}
          label={`Language: ${lang === "en" ? "English" : "മലയാളം"}`}
          onClick={() => { setLang(lang === "en" ? "ml" : "en"); playClick(); }}
        />
        <Row icon={Lock} label="App lock (PIN)" />
        <Row icon={CreditCard} label="Bank accounts" />
        <Row
          icon={LogOut}
          label="Lock app"
          onClick={() => { actions.lock(); playClick(); }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

function Row({ icon: Icon, label, onClick }: { icon: typeof Moon; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}