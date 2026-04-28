import { Home, Send, Gift, History, User } from "lucide-react";
import { playClick, vibrate } from "@/lib/payment-store";

export type Tab = "home" | "pay" | "rewards" | "history" | "profile";

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "pay", label: "Pay", icon: Send },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "history", label: "History", icon: History },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 px-2 z-30">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => {
              playClick();
              vibrate(15);
              onChange(t.id);
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-90"
          >
            <Icon
              className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}