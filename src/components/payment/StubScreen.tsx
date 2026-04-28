import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { playClick, vibrate } from "@/lib/payment-store";
import type { LucideIcon } from "lucide-react";

export function StubScreen({
  title, subtitle, icon: Icon, onBack, accentClass = "from-blue-500 to-purple-600",
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onBack: () => void;
  accentClass?: string;
  children?: React.ReactNode;
}) {
  const I = Icon ?? Sparkles;
  return (
    <div className="h-full flex flex-col bg-background">
      <div className={`bg-gradient-to-br ${accentClass} text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-card`}>
        <button
          onClick={() => { playClick(); vibrate(15); onBack(); }}
          className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 active:scale-90 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <I className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        {children ?? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card p-6 text-center"
          >
            <div className="text-5xl mb-3">✨</div>
            <h2 className="font-bold text-lg mb-1">Coming soon</h2>
            <p className="text-sm text-muted-foreground">
              This feature is part of the full payment ecosystem. The flow, secure UI and
              animations will be wired up in the next iteration.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
              <Badge>🔒 Secure</Badge>
              <Badge>⚡ Instant</Badge>
              <Badge>📥 Receipt</Badge>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <div className="bg-muted rounded-xl py-2 font-medium">{children}</div>;
}