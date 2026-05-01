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
import { SettingsDetailScreen } from "@/components/payment/SettingsDetailScreen";
import { FeatureScreen } from "@/components/payment/FeatureScreen";
import { RechargeScreen, type RechargeKind } from "@/components/payment/RechargeScreen";
import { VoicePayScreen } from "@/components/payment/VoicePayScreen";
import { SplitBillScreen } from "@/components/payment/SplitBillScreen";
import { GamesScreen } from "@/components/payment/GamesScreen";
import type { MoreOptionId } from "@/components/payment/MoreOptionsSheet";

const SETTINGS_IDS = new Set<MoreOptionId>([
  "verify", "upi-id", "security", "change-pin", "privacy", "notifications",
  "theme", "language", "help", "refer", "activity", "devices", "delete-account",
]);
import { initStore, useStore } from "@/lib/payment-store";
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
  const [moreOpt, setMoreOpt] = useState<MoreOptionId | null>(null);
  const [rechargeKind, setRechargeKind] = useState<RechargeKind | null>(null);
  const [voicePay, setVoicePay] = useState(false);
  const [splitBill, setSplitBill] = useState(false);
  const [games, setGames] = useState(false);
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
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
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);

    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const isPreviewHost =
      window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com");
    if (isPreviewHost || isInIframe) {
      navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    } else if ("serviceWorker" in navigator) {
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

  const openGames = () => setGames(true);

  const onPickMore = (id: MoreOptionId) => {
    // Route to existing real flows when possible.
    if (id === "send")     { setOverlay(null); setTab("pay"); return; }
    if (id === "scan")     { setOverlay("scanner"); return; }
    if (id === "soundbox") { window.open("/soundbox", "_blank"); return; }
    if (id === "history")  { setOverlay(null); setTab("history"); return; }
    if (id === "spin" || id === "scratch" || id === "mystery" || id === "play" || id === "wallet") {
      setOverlay(null); setTab("rewards"); return;
    }
    if (id === "recharge") { setRechargeKind("mobile"); return; }
    if (id === "bills")    { setRechargeKind("electric"); return; }
    if (id === "merchant") { setOverlay("merchant"); return; }
    if (id === "voice-pay") { setVoicePay(true); return; }
    if (id === "split-bill") { setSplitBill(true); return; }
    setMoreOpt(id);
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
        {games ? (
          <motion.div key="games" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <GamesScreen onBack={() => setGames(false)} />
          </motion.div>
        ) : voicePay ? (
          <motion.div key="vp" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <VoicePayScreen onBack={() => setVoicePay(false)} />
          </motion.div>
        ) : splitBill ? (
          <motion.div key="sb" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <SplitBillScreen onBack={() => setSplitBill(false)} />
          </motion.div>
        ) : rechargeKind ? (
          <motion.div key={`r-${rechargeKind}`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <RechargeScreen kind={rechargeKind} onBack={() => setRechargeKind(null)} />
          </motion.div>
        ) : moreOpt ? (
          <motion.div key={`mo-${moreOpt}`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            {SETTINGS_IDS.has(moreOpt) ? (
              <SettingsDetailScreen id={moreOpt} onBack={() => setMoreOpt(null)} />
            ) : (
              <FeatureScreen id={moreOpt} onBack={() => setMoreOpt(null)} />
            )}
          </motion.div>
        ) : overlay === "merchant" ? (
          <motion.div key="m" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <MerchantScreen onBack={() => setOverlay(null)} />
          </motion.div>
        ) : overlay === "scanner" ? (
          <motion.div key="s" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 z-20">
            <ScannerScreen
              onBack={() => setOverlay(null)}
              onScanned={(upi) => {
                try { sessionStorage.setItem("gpay-prefill-upi", upi); } catch { /* ignore */ }
                setOverlay(null);
                setTab("pay");
              }}
            />
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            {tab === "home" && (
              <HomeScreen
                onNavigate={navigate}
                online={online}
                onInstall={handleInstall}
                canInstall={!!installEvent}
                onPickMore={onPickMore}
                onOpenGames={openGames}
              />
            )}
            {tab === "pay" && <PayScreen onBack={() => setTab("home")} onShowReward={(id) => { setOpenRewardId(id); setTab("rewards"); }} />}
            {tab === "rewards" && <RewardsScreen openCardId={openRewardId} onClearOpenCard={() => setOpenRewardId(null)} />}
            {tab === "history" && <HistoryScreen />}
            {tab === "profile" && (
              <ProfileScreen
                onMerchant={() => setOverlay("merchant")}
                onSoundbox={() => window.open("/soundbox", "_blank")}
                onPickMore={onPickMore}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active={tab} onChange={(t) => { setOverlay(null); setMoreOpt(null); setRechargeKind(null); setVoicePay(false); setSplitBill(false); setGames(false); setTab(t); }} />
      <Toaster position="top-center" />
    </PhoneFrame>
  );
}

function prettyTitle(id: MoreOptionId): string {
  const map: Record<MoreOptionId, string> = {
    send: "Send Money", request: "Request Money", scan: "Scan QR", recharge: "Mobile Recharge",
    bills: "Pay Bills", "bank-transfer": "Bank Transfer", "upi-id": "UPI ID", self: "Self Transfer",
    approve: "Approve to Pay", intl: "International Transfer",
    spin: "Spin Wheel", scratch: "Scratch Cards", mystery: "Mystery Box", play: "Play & Earn", wallet: "Rewards Wallet",
    history: "Transaction History", receipt: "Download Receipt", analytics: "Analytics Dashboard", spending: "Spending Summary", statement: "Monthly Statement",
    "add-bank": "Add Bank Account", cards: "Manage Cards", "change-pin": "Change PIN", security: "Security Settings", account: "Account Details",
    soundbox: "Sound Box", offline: "Offline Payment", offers: "Offers", refer: "Refer & Earn", invite: "Invite Friends",
    settings: "Settings", dark: "Dark Mode", language: "Language", help: "Help & Support", about: "About Us",
    voucher: "Voucher Wallet", "upi-lite": "UPI Lite", autopay: "AutoPay", insurance: "Insurance",
    gold: "Gold & Silver", "mutual-funds": "Mutual Funds", "credit-score": "Credit Score",
    "loan-offers": "Loan Offers", donations: "Donations",
    travel: "Travel Bookings", movies: "Movie Tickets", events: "Event Bookings",
    emi: "EMI Calculator", currency: "Currency Converter", nearby: "Nearby Stores",
    verify: "Profile Verification", privacy: "Privacy Controls", notifications: "Notifications",
    theme: "Theme & Appearance", activity: "Account Activity", devices: "Manage Devices",
    "delete-account": "Delete Account", merchant: "Merchant Mode",
    "voice-pay": "Voice Pay", "split-bill": "Split Bill",
  };
  return map[id];
}

// satisfy unused warning
export type { Screen };

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
