import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BadgeCheck, ShieldCheck, CreditCard, Lock, EyeOff, Bell,
  Palette, Globe, HelpCircle, Users, Activity, Smartphone, Trash2, Store, Volume2, Pencil, Check,
  WifiOff, Download, CheckCircle, ExternalLink, RefreshCw, Info, Share, MoreVertical, Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { actions, playClick, vibrate, playSuccess } from "@/lib/payment-store";
import type { MoreOptionId } from "./MoreOptionsSheet";
import { toast } from "sonner";
import { AdminPinScreen } from "./AdminPinScreen";
import { AdminDashboardScreen } from "./AdminDashboardScreen";

type Row = { icon: LucideIcon; label: string; sub: string; tint: string; onClick?: () => void; danger?: boolean };
type Section = { title: string; rows: Row[] };

export function ProfileScreen({
  onMerchant,
  onSoundbox,
  onPickMore,
}: {
  onMerchant: () => void;
  onSoundbox: () => void;
  onPickMore: (id: MoreOptionId) => void;
}) {
  const [dark, setDark] = useState(false);
  const [name, setName] = useState("User Name");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [editing, setEditing] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showNativeInstallPopup, setShowNativeInstallPopup] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    if (saved) document.documentElement.classList.add("dark");
    const n = localStorage.getItem("gpay-user-name");
    const p = localStorage.getItem("gpay-user-phone");
    if (n) setName(n);
    if (p) setPhone(p);
    
    // Check if app is already installed
    const installed = localStorage.getItem("pwa-installed") === "true";
    setIsInstalled(installed);
    
    // Check if running as PWA (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);
    
    if (standalone) {
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
    }
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA install prompt available');
    };
    
    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
      playSuccess();
      vibrate([20, 30, 20]);
      toast.success("App installed successfully! 🎉");
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  const saveProfile = () => {
    const n = name.trim() || "User Name";
    const p = phone.trim() || "+91 98765 43210";
    setName(n); setPhone(p);
    localStorage.setItem("gpay-user-name", n);
    localStorage.setItem("gpay-user-phone", p);
    setEditing(false);
    playClick(); vibrate(15);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    playClick(); vibrate(15);
  };
  
  const handleInstallClick = () => {
    playClick();
    vibrate(15);
    
    // Always show the popup first - no pre-checks
    // User must explicitly tap "Install" inside the popup
    setShowNativeInstallPopup(true);
  };
  
  const handleNativeInstallConfirm = async () => {
    playClick();
    vibrate(15);
    
    // Check if already installed ONLY when user taps Install
    if (isStandalone) {
      setShowNativeInstallPopup(false);
      toast.success("You're already using the installed app!");
      return;
    }
    
    if (isInstalled) {
      setShowNativeInstallPopup(false);
      toast.info("App is already installed. Open it from your home screen!");
      return;
    }
    
    // Check if PWA install prompt is available
    if (!deferredPrompt) {
      // Show manual instructions if prompt not available
      setShowNativeInstallPopup(false);
      setShowManualInstructions(true);
      return;
    }
    
    try {
      // Trigger the PWA install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        playSuccess();
        vibrate([20, 30, 20]);
        setIsInstalled(true);
        localStorage.setItem("pwa-installed", "true");
        setShowNativeInstallPopup(false);
        toast.success("App installed successfully! 🎉");
      } else {
        console.log('User dismissed the install prompt');
        setShowNativeInstallPopup(false);
        toast.info("Installation cancelled");
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      // Show manual instructions as fallback
      setShowNativeInstallPopup(false);
      setShowManualInstructions(true);
    }
  };
  
  const handleNativeInstallCancel = () => {
    playClick();
    vibrate(10);
    setShowNativeInstallPopup(false);
  };
  
  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show manual instructions if prompt not available
      playClick();
      vibrate(15);
      setShowInstallDialog(false);
      setShowManualInstructions(true);
      return;
    }
    
    playClick();
    vibrate(15);
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        playSuccess();
        vibrate([20, 30, 20]);
        setIsInstalled(true);
        localStorage.setItem("pwa-installed", "true");
        toast.success("App installed successfully! 🎉");
      } else {
        console.log('User dismissed the install prompt');
        toast.info("Installation cancelled");
      }
      
      setDeferredPrompt(null);
      setShowInstallDialog(false);
    } catch (error) {
      console.error('Install error:', error);
      // Show manual instructions as fallback
      setShowInstallDialog(false);
      setShowManualInstructions(true);
    }
  };
  
  const handleOpenApp = () => {
    playClick();
    vibrate(15);
    
    if (isStandalone) {
      toast.success("You're already using the installed app!");
    } else {
      toast.info("Please open the app from your home screen");
    }
    setShowInstallDialog(false);
  };
  
  const handleCheckUpdates = () => {
    playClick();
    vibrate(15);
    
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().then(() => {
            toast.success("You're using the latest version!");
          });
        } else {
          toast.success("You're using the latest version!");
        }
      });
    } else {
      toast.success("You're using the latest version!");
    }
  };
  
  const handleVersionTap = () => {
    setAdminTapCount(prev => prev + 1);
    if (adminTapCount + 1 >= 5) {
      playClick();
      vibrate(15);
      setShowAdminPin(true);
      setAdminTapCount(0);
    }
  };
  
  const handleAdminPinSuccess = () => {
    setShowAdminPin(false);
    setShowAdminDashboard(true);
  };

  const tap = (fn?: () => void) => () => { playClick(); vibrate(15); fn?.(); };
  const go = (id: MoreOptionId) => () => { playClick(); vibrate(15); onPickMore(id); };

  const sections: Section[] = [
    {
      title: "Account & Security",
      rows: [
        { icon: BadgeCheck, label: "Profile Verification", sub: "Verify your identity", tint: "from-emerald-500 to-teal-600", onClick: () => onPickMore("verify") },
        { icon: CreditCard, label: "UPI & Payment Settings", sub: "Manage UPI ID, linked accounts & limits", tint: "from-violet-500 to-purple-600", onClick: () => onPickMore("upi-id") },
        { icon: ShieldCheck, label: "Security Center", sub: "Manage PIN, biometric & security", tint: "from-blue-500 to-sky-600", onClick: () => onPickMore("security") },
        { icon: Lock, label: "Change PIN", sub: "Update your 4-digit secure PIN", tint: "from-orange-500 to-amber-600", onClick: () => onPickMore("change-pin") },
        { icon: WifiOff, label: "Offline Mode", sub: "Use app without internet · store locally", tint: "from-orange-500 to-red-600", onClick: () => onPickMore("offline") },
        { icon: EyeOff, label: "Privacy Controls", sub: "Control who can see your information", tint: "from-cyan-500 to-teal-600", onClick: () => onPickMore("privacy") },
        { icon: Bell, label: "Notification Settings", sub: "Customize alerts & notifications", tint: "from-amber-500 to-orange-500", onClick: () => onPickMore("notifications") },
      ],
    },
    {
      title: "Preferences",
      rows: [
        { icon: Palette, label: dark ? "Theme: Dark" : "Theme & Appearance", sub: "Choose app theme & display mode", tint: "from-pink-500 to-rose-600", onClick: toggleDark },
        { icon: Globe, label: "Language", sub: "Select your preferred language", tint: "from-blue-500 to-indigo-600", onClick: () => onPickMore("language") },
        { icon: Download, label: isInstalled ? "App Installed" : "Install App", sub: isInstalled ? "Open app or check for updates" : "Add this app to your device for faster access", tint: "from-purple-500 to-fuchsia-600", onClick: handleInstallClick },
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
        { icon: HelpCircle, label: "Help & Support", sub: "Get help, FAQs and contact support", tint: "from-amber-500 to-yellow-500", onClick: () => onPickMore("help") },
        { icon: Users, label: "Refer & Earn", sub: "Invite friends and earn rewards", tint: "from-emerald-500 to-teal-600", onClick: () => onPickMore("refer") },
        { icon: Activity, label: "Account Activity", sub: "View recent logins & account activity", tint: "from-rose-500 to-red-500", onClick: () => onPickMore("activity") },
        { icon: Smartphone, label: "Manage Devices", sub: "Manage devices linked to your account", tint: "from-slate-500 to-slate-700", onClick: () => onPickMore("devices") },
        { icon: Trash2, label: "Delete Account", sub: "Permanently delete your account", tint: "from-red-500 to-rose-700", danger: true, onClick: () => onPickMore("delete-account") },
      ],
    },
  ];
  void go; // silence unused

  return (
    <>
      {/* Admin PIN Screen */}
      {showAdminPin && (
        <div className="absolute inset-0 z-50">
          <AdminPinScreen 
            onBack={() => setShowAdminPin(false)} 
            onSuccess={handleAdminPinSuccess}
          />
        </div>
      )}
      
      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <div className="absolute inset-0 z-50">
          <AdminDashboardScreen onBack={() => setShowAdminDashboard(false)} />
        </div>
      )}
      
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

      {/* User card — editable */}
      <div className="px-4 mt-1">
        <motion.div
          whileTap={editing ? undefined : { scale: 0.98 }}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {(name || "U").trim().charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-1.5">
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={28}
                  placeholder="Your name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-[14px] font-semibold outline-none focus:border-emerald-500"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="Phone number"
                  inputMode="tel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-[12px] outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <>
                <p className="font-semibold text-[15px] truncate">{name}</p>
                <p className="text-xs text-slate-400">{phone}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              </>
            )}
          </div>
          <button
            onClick={editing ? saveProfile : tap(() => setEditing(true))}
            className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center active:scale-90 transition-transform"
            aria-label={editing ? "Save profile" : "Edit profile"}
          >
            {editing ? <Check className="h-4 w-4 text-emerald-400" /> : <Pencil className="h-4 w-4 text-slate-300" />}
          </button>
        </motion.div>
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
      
      {/* Hidden Admin Access - Tap 5 times */}
      <button
        onClick={handleVersionTap}
        className="w-full text-center py-4 active:bg-slate-900/20 transition"
      >
        <p className="text-[8px] text-slate-700">
          {adminTapCount > 0 && adminTapCount < 5 && `Tap ${5 - adminTapCount} more times for admin`}
        </p>
      </button>
      
      {/* Native-Style Install Popup (Bottom Sheet) */}
      <AnimatePresence>
        {showNativeInstallPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleNativeInstallCancel}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Native Install Popup - Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50"
            >
              <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>
                
                {/* Content */}
                <div className="px-6 pb-6 pt-2">
                  {/* App Info */}
                  <div className="flex items-center gap-4 mb-6">
                    {/* App Icon */}
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
                      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    {/* App Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-100 truncate">GPay Demo</h3>
                      <p className="text-sm text-slate-400 truncate">{window.location.hostname}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-500">Secure connection</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      This app will be installed on your device. You can launch it from your home screen and use it offline.
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-400">Fast Access</p>
                    </div>
                    <div className="text-center">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <WifiOff className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-xs text-slate-400">Works Offline</p>
                    </div>
                    <div className="text-center">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-400">Native Feel</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleNativeInstallCancel}
                      className="flex-1 h-12 rounded-xl bg-slate-800 text-slate-200 font-semibold active:scale-95 transition-transform"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNativeInstallConfirm}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold active:scale-95 transition-transform shadow-lg shadow-emerald-900/30"
                    >
                      Install
                    </button>
                  </div>
                  
                  {/* Fallback hint */}
                  {!deferredPrompt && (
                    <button
                      onClick={() => {
                        setShowNativeInstallPopup(false);
                        setShowManualInstructions(true);
                      }}
                      className="w-full mt-3 text-xs text-center text-slate-500 hover:text-slate-400 transition flex items-center justify-center gap-1"
                    >
                      <Info className="h-3 w-3" />
                      Show manual installation steps
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Install App Dialog */}
      <AnimatePresence>
        {showInstallDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallDialog(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                {!isInstalled ? (
                  <>
                    {/* Install View */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="h-20 w-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-900/40"
                      >
                        <Download className="h-10 w-10 text-white" strokeWidth={2.5} />
                      </motion.div>
                      <h2 className="text-xl font-bold mb-2">Install Payment App</h2>
                      <p className="text-sm text-slate-400">
                        Add to home screen for faster access
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Instant Access</p>
                          <p className="text-xs text-slate-400">Launch directly from home screen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <WifiOff className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Offline Ready</p>
                          <p className="text-xs text-slate-400">Works without internet connection</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Smartphone className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Native Experience</p>
                          <p className="text-xs text-slate-400">Full-screen app without browser UI</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowInstallDialog(false)}
                        className="flex-1 h-12 rounded-xl bg-slate-800 font-semibold active:scale-95 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleInstall}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-semibold active:scale-95 transition flex items-center justify-center gap-2"
                      >
                        <Download className="h-5 w-5" />
                        Install
                      </button>
                    </div>
                    
                    {!deferredPrompt && (
                      <button
                        onClick={() => {
                          setShowInstallDialog(false);
                          setShowManualInstructions(true);
                        }}
                        className="w-full mt-3 text-xs text-center text-slate-400 hover:text-slate-300 transition flex items-center justify-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        Show manual instructions
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Installed View */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="h-20 w-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40"
                      >
                        <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                      </motion.div>
                      <h2 className="text-xl font-bold mb-2">App Installed ✓</h2>
                      <p className="text-sm text-slate-400">
                        {isStandalone 
                          ? "You're using the installed app" 
                          : "Open from your home screen for best experience"}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {!isStandalone && (
                        <button
                          onClick={handleOpenApp}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
                        >
                          <ExternalLink className="h-5 w-5" />
                          Open App
                        </button>
                      )}
                      <button
                        onClick={handleCheckUpdates}
                        className="w-full h-12 rounded-xl bg-slate-800 font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Check for Updates
                      </button>
                      <button
                        onClick={() => setShowInstallDialog(false)}
                        className="w-full h-12 rounded-xl bg-slate-800/50 font-semibold active:scale-95 transition"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Manual Installation Instructions Dialog */}
      <AnimatePresence>
        {showManualInstructions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualInstructions(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto max-h-[80vh] overflow-y-auto"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                  >
                    <Info className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-2">Manual Installation</h2>
                  <p className="text-sm text-slate-400">
                    Follow these steps to add the app to your home screen
                  </p>
                </div>
                
                {/* iOS Instructions */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-lg">🍎</span>
                    </div>
                    <h3 className="font-bold">iPhone / iPad (Safari)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">1</span>
                      <p>Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button at the bottom</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                      <p>Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>"Add to Home Screen"</strong></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                      <p>Tap <strong>"Add"</strong> in the top right corner</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">4</span>
                      <p>Find the app icon on your home screen</p>
                    </div>
                  </div>
                </div>
                
                {/* Android Instructions */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <h3 className="font-bold">Android (Chrome)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                      <p>Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> <strong>Menu</strong> button (three dots)</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                      <p>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                      <p>Tap <strong>"Install"</strong> or <strong>"Add"</strong></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                      <p>The app will appear on your home screen</p>
                    </div>
                  </div>
                </div>
                
                {/* Benefits reminder */}
                <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-slate-300 text-center">
                    <strong>💡 Tip:</strong> Once installed, the app will open in full-screen mode without browser UI and work offline!
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    playClick();
                    vibrate(15);
                    setShowManualInstructions(false);
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold active:scale-95 transition"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
