import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PhoneFrame } from "@/components/payment/PhoneFrame";
import { BottomNav, type Tab } from "@/components/payment/BottomNav";
import { HomeScreen } from "@/components/payment/HomeScreen";
import { PayScreen } from "@/components/payment/PayScreen";
import { RewardsScreen } from "@/components/payment/RewardsScreen";
import { HistoryScreen } from "@/components/payment/HistoryScreen";
import { ProfileScreen } from "@/components/payment/ProfileScreen";
import { MerchantScreen } from "@/components/payment/MerchantScreen";
import { ScannerScreen } from "@/components/payment/ScannerScreen";
import { LockScreen } from "@/components/payment/LockScreen";
import { initStore, useStore, actions } from "@/lib/payment-store";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GPay Clone — Demo Payment App" },
      { name: "description", content: "A Google Pay style demo payment app with rewards, sound box, and offline support." },
      { name: "theme-color", content: "#1a8754" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.svg" },
    ],
  }),
  component: Index,
});

type Screen = Tab | "merchant" | "scanner";

function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<"merchant" | "scanner" | null>(null);
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<{ prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [openRewardId, setOpenRewardId] = useState<string | null>(null);
  const unlocked = useStore((s) => s.unlocked);

  useEffect(() => {
    initStore();
    const dark = localStorage.getItem("theme") === "dark";
    if (dark) document.documentElement.classList.add("dark");
    setOnline(navigator.onLine);
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);

    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as unknown as typeof installEvent extends infer T ? T : never);
    };
    window.addEventListener("beforeinstallprompt", onInstall);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", onOn);
      window.removeEventListener("offline", onOff);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  };

  const navigate = (t: Tab | "merchant" | "scanner" | "soundbox") => {
    if (t === "soundbox") {
      window.open("/soundbox", "_blank");
      return;
    }
    if (t === "merchant" || t === "scanner") {
      setOverlay(t);
    } else {
      setOverlay(null);
      setTab(t);
    }
  };

  if (!unlocked) {
    return (
      <PhoneFrame>
        <LockScreen />
        <Toaster position="top-center" />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            className="absolute top-0 left-0 right-0 bg-yellow-500 text-slate-900 text-xs font-semibold py-1 text-center z-40 flex items-center justify-center gap-1"
          >
            <WifiOff className="h-3 w-3" /> Offline mode — using demo data
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {overlay === "merchant" ? (
          <motion.div key="m" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <MerchantScreen onBack={() => setOverlay(null)} />
          </motion.div>
        ) : overlay === "scanner" ? (
          <motion.div key="s" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <ScannerScreen onBack={() => setOverlay(null)} onScanned={(_upi) => { setOverlay(null); setTab("pay"); }} />
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            {tab === "home" && (
              <HomeScreen
                onNavigate={navigate}
                online={online}
                onInstall={handleInstall}
                canInstall={!!installEvent}
              />
            )}
            {tab === "pay" && <PayScreen onBack={() => setTab("home")} onShowReward={(id) => { setOpenRewardId(id); setTab("rewards"); }} />}
            {tab === "rewards" && <RewardsScreen openCardId={openRewardId} onClearOpenCard={() => setOpenRewardId(null)} />}
            {tab === "history" && <HistoryScreen />}
            {tab === "profile" && <ProfileScreen onMerchant={() => setOverlay("merchant")} onSoundbox={() => window.open("/soundbox", "_blank")} />}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active={tab} onChange={(t) => { setOverlay(null); setTab(t); }} />
      <Toaster position="top-center" />
    </PhoneFrame>
  );
}

// satisfy unused warning
export type { Screen };
