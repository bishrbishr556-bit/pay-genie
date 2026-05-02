import { useEffect, useState } from "react";
import { useStore, playClick, vibrate } from "@/lib/payment-store";
import {
  Bell, Wifi, WifiOff, QrCode, Send, Smartphone, Zap, Tv, Droplet,
  TrendingUp, Store, Volume2, MoreHorizontal, Eye, EyeOff, Plus, History,
  FileDown, Sparkles, Flame, Users, ChevronRight, Gamepad2, CircleDot,
  ShieldCheck, BarChart3, Bot, Mic, Receipt,
  Building2, AtSign, UserCheck, UsersRound, Gift, BadgePercent,
  CreditCard, Gauge, ShieldPlus, Plane, Ticket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tab } from "./BottomNav";
import { MoreOptionsSheet, type MoreOptionId } from "./MoreOptionsSheet";
import type { LucideIcon } from "lucide-react";

type NavTarget = Tab | "soundbox" | "merchant" | "scanner";

const NOTIF = [
  { icon: "💰", text: "You got ₹50 cashback" },
  { icon: "🎡", text: "Spin available now" },
  { icon: "🔥", text: "3-day streak — keep it up!" },
  { icon: "🎁", text: "New scratch card unlocked" },
];

export function HomeScreen({
  onNavigate, online, onInstall, canInstall, onPickMore, onOpenGames, onOpenAll,
}: {
  onNavigate: (t: NavTarget) => void;
  online: boolean;
  onInstall: () => void;
  canInstall: boolean;
  onPickMore: (id: MoreOptionId) => void;
  onOpenGames: () => void;
  onOpenAll?: () => void;
}) {
  const balance = useStore((s) => s.balance);
  const cashback = useStore((s) => s.cashback);
  const txns = useStore((s) => s.txns);
  const rewards = useStore((s) => s.rewards);

  const [hideBal, setHideBal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [notifIdx, setNotifIdx] = useState(0);
  const [coins] = useState(420);
  const streak = 3;

  useEffect(() => {
    const t = setInterval(() => setNotifIdx((i) => (i + 1) % NOTIF.length), 3500);
    return () => clearInterval(t);
  }, []);

  const unscratched = rewards.filter((r) => !r.scratched).length;

  return (
    <div className="pb-24 overflow-y-auto h-full bg-background">
      {/* Header gradient */}
      <div className="relative gradient-primary text-primary-foreground px-5 pt-12 pb-10 rounded-b-[28px] shadow-card overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold">U</div>
            <div>
              <p className="text-[10px] opacity-80">Hello,</p>
              <p className="font-semibold text-sm">User</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] bg-white/15 px-2 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3" /> Secured
            </span>
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-yellow-200" />}
            <button onClick={() => { playClick(); vibrate(10); }}>
              <Bell className="h-5 w-5" />
            </button>
            <button
              aria-label="More options"
              onClick={() => { playClick(); vibrate(15); setShowMore(true); }}
              className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Balance card glass */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs opacity-80">Available balance</p>
            <button onClick={() => { playClick(); setHideBal((v) => !v); }} className="opacity-80">
              {hideBal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <motion.p
            key={hideBal ? "h" : balance}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            {hideBal ? "₹ ••••••" : `₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          </motion.p>
          <p className="text-[11px] opacity-70 mt-1">A/c XX1234 · HDFC Bank</p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <MiniBal label="Cashback" value={`₹${cashback}`} icon="🪙" />
            <MiniBal label="Coins" value={String(coins)} icon="💎" />
            <MiniBal label="Rewards" value={String(unscratched)} icon="🎁" />
          </div>

          <div className="flex gap-2 mt-3">
            <SmallBtn icon={Plus} label="Add Money" onClick={() => onPickMore("add-bank")} />
            <SmallBtn icon={History} label="History" onClick={() => onNavigate("history")} />
            <SmallBtn icon={FileDown} label="Receipt" onClick={() => onPickMore("receipt")} />
          </div>
        </div>
      </div>

      {/* Notification banner */}
      <div className="mx-5 -mt-5 relative z-10">
        <div className="bg-card/95 backdrop-blur rounded-2xl shadow-card px-3 py-2.5 flex items-center gap-2 overflow-hidden">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <AnimatePresence mode="wait">
            <motion.div key={notifIdx}
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-medium flex items-center gap-2 flex-1 min-w-0"
            >
              <span>{NOTIF[notifIdx].icon}</span>
              <span className="truncate">{NOTIF[notifIdx].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Smart Assistant card */}
      <div className="px-5 mt-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-2xl p-4 shadow-card">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-xl" />
          <div className="relative flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm">Smart Assistant</p>
                <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5">AI</span>
              </div>
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs opacity-90 mt-1">
                ⚡ Your electricity bill of <b>₹420</b> is due in 2 days. Want to pay now and earn ₹5 cashback?
              </motion.p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { playClick(); vibrate(15); onPickMore("bills"); }}
                  className="bg-white text-violet-700 text-[11px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                  Pay Now
                </button>
                <button onClick={() => { playClick(); vibrate(10); onPickMore("voice-pay"); }}
                  className="flex items-center gap-1 bg-white/20 backdrop-blur text-[11px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                  <Mic className="h-3 w-3" /> Voice Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Pay shortcuts */}
      <div className="px-5 mt-3">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 scrollbar-hide pb-1">
          <QuickChip emoji="💸" label="Pay Rahim ₹500" onClick={() => onNavigate("pay")} />
          <QuickChip emoji="📱" label="Recharge ₹199" onClick={() => onPickMore("recharge")} />
          <QuickChip emoji="⚡" label="Electric ₹420" onClick={() => onPickMore("bills")} />
          <QuickChip emoji="🧾" label="Split Bill" onClick={() => onPickMore("split-bill")} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-5 gap-2">
          <QuickAction icon={Send} label="Send" color="from-blue-500 to-blue-600" onClick={() => onNavigate("pay")} />
          <QuickAction icon={QrCode} label="Scan" color="from-purple-500 to-fuchsia-600" onClick={() => onNavigate("scanner")} />
          <QuickAction icon={Store} label="Merchant" color="from-orange-500 to-amber-600" onClick={() => onNavigate("merchant")} />
          <QuickAction icon={Volume2} label="SoundBox" color="from-pink-500 to-rose-600" onClick={() => onNavigate("soundbox")} />
          <QuickAction icon={MoreHorizontal} label="More" color="from-slate-500 to-slate-700" onClick={() => { setShowMore(true); }} />
        </div>
      </div>

      {/* Pending Bills widget */}
      <div className="px-5 mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><Receipt className="h-4 w-4" /> Pending Bills</h3>
            <span className="text-[10px] bg-rose-500/15 text-rose-600 font-semibold px-2 py-0.5 rounded-full">2 due</span>
          </div>
          <div className="space-y-2">
            <PendingBill icon={Zap} color="from-amber-500 to-orange-500" name="Electricity (KSEB)" due="Due in 2 days" amount={420} onPay={() => onPickMore("bills")} />
            <PendingBill icon={Smartphone} color="from-emerald-500 to-teal-600" name="Airtel Prepaid" due="Expires in 3 days" amount={199} onPay={() => onPickMore("recharge")} />
          </div>
        </div>
      </div>

      {/* Spin & Rewards interactive widget */}
      <button
        onClick={() => { playClick(); vibrate(20); onNavigate("rewards"); }}
        className="mx-5 mt-4 w-[calc(100%-2.5rem)] relative overflow-hidden rounded-2xl p-4 text-left shadow-card active:scale-[0.98] transition-transform
                   bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="h-14 w-14 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shadow-inner"
          >
            <CircleDot className="h-8 w-8" />
          </motion.div>
          <div className="flex-1">
            <p className="font-bold text-sm">🎡 Spin & Win Daily</p>
            <p className="text-[11px] opacity-90">2 spins available · {unscratched} scratch cards</p>
            <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-white rounded-full" />
            </div>
            <p className="text-[10px] mt-1 opacity-90">XP · Beginner Lv 1 · Next reward in 2 spins</p>
          </div>
          <div className="bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">SPIN</div>
        </div>
      </button>

      {/* Play & Earn */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Gamepad2 className="h-4 w-4" /> Play & Earn</h3>
          <button onClick={() => { playClick(); onOpenGames(); }} className="text-[11px] text-primary font-semibold flex items-center">View all <ChevronRight className="h-3 w-3" /></button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <GameTile emoji="🎡" label="Spin"     color="from-purple-600 to-violet-700"  onClick={onOpenGames} />
          <GameTile emoji="🪙" label="Scratch"  color="from-emerald-600 to-green-700"  onClick={onOpenGames} />
          <GameTile emoji="❓" label="Quiz"     color="from-blue-600 to-indigo-700"    onClick={onOpenGames} />
          <GameTile emoji="🎁" label="Lucky"    color="from-rose-600 to-red-700"       onClick={onOpenGames} />
          <GameTile emoji="🃏" label="Card Flip" color="from-fuchsia-600 to-purple-700" onClick={onOpenGames} />
          <GameTile emoji="👆" label="Tap"      color="from-sky-600 to-blue-700"       onClick={onOpenGames} />
          <GameTile emoji="🎲" label="Dice"     color="from-amber-600 to-orange-700"   onClick={onOpenGames} />
          <GameTile emoji="🧠" label="Memory"   color="from-emerald-600 to-teal-700"   onClick={onOpenGames} />
          <GameTile emoji="🫧" label="Bubble"   color="from-pink-500 to-fuchsia-700"   onClick={onOpenGames} />
          <GameTile emoji="🗝️" label="Treasure" color="from-amber-600 to-yellow-700"   onClick={onOpenGames} />
          <GameTile emoji="🍉" label="Fruit"    color="from-lime-500 to-green-700"     onClick={onOpenGames} />
          <GameTile emoji="🚀" label="Rocket"   color="from-indigo-600 to-purple-800"  onClick={onOpenGames} />
        </div>
      </div>

      {/* Bills & Recharge */}
      <div className="px-5 mt-5">
        <h3 className="text-sm font-semibold mb-2">Bills & Recharge</h3>
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
          <QuickAction icon={Smartphone} label="Mobile"   color="from-emerald-500 to-teal-600" onClick={() => onPickMore("recharge")} />
          <QuickAction icon={Zap}        label="Electric" color="from-amber-500 to-orange-600" onClick={() => onPickMore("bills")} />
          <QuickAction icon={Tv}         label="DTH"      color="from-rose-500 to-pink-600"    onClick={() => onPickMore("bills")} />
          <QuickAction icon={Droplet}    label="Water"    color="from-sky-500 to-blue-600"     onClick={() => onPickMore("bills")} />
        </div>
      </div>

      {/* Send Money To */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Send className="h-4 w-4" /> Send Money To</h3>
          <button onClick={() => { playClick(); onNavigate("pay"); }} className="text-[11px] text-primary font-semibold flex items-center">View all <ChevronRight className="h-3 w-3" /></button>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
          <QuickAction icon={Smartphone} label="Mobile"   color="from-emerald-500 to-teal-600" onClick={() => onNavigate("pay")} />
          <QuickAction icon={Building2}  label="Bank"     color="from-violet-500 to-purple-600" onClick={() => onPickMore("bank-transfer")} />
          <QuickAction icon={AtSign}     label="UPI ID"   color="from-pink-500 to-rose-600"     onClick={() => onPickMore("upi-id")} />
          <QuickAction icon={QrCode}     label="Scan QR"  color="from-purple-500 to-fuchsia-600" onClick={() => onNavigate("scanner")} />
          <QuickAction icon={Users}      label="Contacts" color="from-blue-500 to-indigo-600"   onClick={() => onPickMore("pay-contact")} />
          <QuickAction icon={UsersRound} label="Groups"   color="from-cyan-500 to-sky-600"      onClick={() => onPickMore("split-bill")} />
          <QuickAction icon={UserCheck}  label="Self"     color="from-indigo-500 to-blue-600"   onClick={() => onPickMore("self")} />
          <QuickAction icon={Receipt}    label="Bills"    color="from-amber-500 to-orange-600"  onClick={() => onPickMore("bills")} />
        </div>
      </div>

      {/* Offers For You */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-500" /> Offers For You</h3>
          <button onClick={() => { playClick(); onPickMore("offers"); }} className="text-[11px] text-primary font-semibold flex items-center">View all <ChevronRight className="h-3 w-3" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <OfferCard emoji="💰" title="₹50 Cashback" sub="On bills above ₹500" color="from-emerald-500 to-teal-600" onClick={() => onPickMore("offers")} />
          <OfferCard emoji="🎁" title="₹100 Bonus"   sub="First UPI of the day" color="from-fuchsia-500 to-purple-600" onClick={() => onPickMore("offers")} />
          <OfferCard emoji="🎉" title="Festival Offer" sub="Up to 30% off" color="from-rose-500 to-pink-600" onClick={() => onPickMore("offers")} />
          <OfferCard emoji="👥" title="Refer Bonus"  sub="Invite & earn ₹100" color="from-amber-500 to-orange-600" onClick={() => onPickMore("refer")} />
        </div>
      </div>

      {/* Services */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Services</h3>
          <button onClick={() => { playClick(); onOpenAll?.(); }} className="text-[11px] text-primary font-semibold flex items-center">All <ChevronRight className="h-3 w-3" /></button>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-4 gap-3">
          <QuickAction icon={Receipt}      label="Bills"    color="from-orange-500 to-red-500"     onClick={() => onPickMore("bills")} />
          <QuickAction icon={Smartphone}   label="Recharge" color="from-emerald-500 to-teal-600"   onClick={() => onPickMore("recharge")} />
          <QuickAction icon={CreditCard}   label="Cards"    color="from-violet-500 to-purple-600"  onClick={() => onPickMore("cards")} />
          <QuickAction icon={BadgePercent} label="Loans"    color="from-rose-500 to-red-600"       onClick={() => onPickMore("loan-offers")} />
          <QuickAction icon={Gauge}        label="Credit"   color="from-purple-500 to-pink-600"    onClick={() => onPickMore("credit-score")} />
          <QuickAction icon={ShieldPlus}   label="Insurance" color="from-blue-500 to-indigo-600"   onClick={() => onPickMore("insurance")} />
          <QuickAction icon={Plane}        label="Travel"   color="from-sky-500 to-blue-600"       onClick={() => onPickMore("travel")} />
          <QuickAction icon={Ticket}       label="Tickets"  color="from-fuchsia-500 to-purple-600" onClick={() => onPickMore("movies")} />
        </div>
      </div>

      {/* Insights */}
      <div className="px-5 mt-5">
        <button
          onClick={() => { playClick(); vibrate(10); onPickMore("analytics"); }}
          className="w-full text-left bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-2xl p-4 shadow-card active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] opacity-80 flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Spending Insights</p>
              <p className="text-lg font-bold mt-0.5">You spent ₹2,450 this week</p>
              <p className="text-[11px] opacity-80 mt-0.5">📈 12% less than last week</p>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[35, 55, 25, 70, 45, 85, 60].map((h, i) => (
                <div key={i} className="w-1.5 bg-white/80 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* Streak + Referral */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-3 shadow-card">
          <div className="flex items-center gap-1 text-[11px] font-semibold opacity-90">
            <Flame className="h-3.5 w-3.5" /> Daily Streak
          </div>
          <p className="text-2xl font-bold mt-1">{streak} 🔥</p>
          <div className="h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${(streak / 7) * 100}%` }} />
          </div>
          <p className="text-[10px] opacity-90 mt-1">Day {streak}/7 · Jackpot on Day 7</p>
        </div>
        <button onClick={() => onPickMore("refer")} className="text-left bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl p-3 shadow-card active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-1 text-[11px] font-semibold opacity-90">
            <Users className="h-3.5 w-3.5" /> Refer & Earn
          </div>
          <p className="text-sm font-bold mt-1">Invite & get ₹100</p>
          <div className="h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-white w-2/5" />
          </div>
          <p className="text-[10px] opacity-90 mt-1">2/5 invites · +1 spin each</p>
        </button>
      </div>

      {/* Mini analytics */}
      <div className="px-5 mt-5">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> This Month</h3>
            <button onClick={() => onPickMore("analytics")} className="text-[11px] text-primary font-semibold">Details ›</button>
          </div>
          <div className="flex items-end gap-1.5 h-16 mt-2">
            {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
            <div><p className="text-muted-foreground">Earned</p><p className="font-bold text-emerald-600">+₹250</p></div>
            <div><p className="text-muted-foreground">Spent</p><p className="font-bold text-rose-600">-₹1,200</p></div>
          </div>
        </div>
      </div>

      {/* Install banner */}
      {canInstall && (
        <div className="mx-5 mt-4 gradient-reward text-white rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs opacity-90">Add to home screen for native experience</p>
          </div>
          <button onClick={() => { playClick(); vibrate(20); onInstall(); }}
            className="bg-white text-purple-700 text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform">
            Install
          </button>
        </div>
      )}

      {/* Recent */}
      {txns.length > 0 && (
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Recent activity</h3>
            <button onClick={() => onNavigate("history")} className="text-[11px] text-primary font-semibold">View all ›</button>
          </div>
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

      {/* Smart suggestions */}
      <div className="px-5 mt-5 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> For you</h3>
        <div className="space-y-2">
          <SuggestCard icon="💸" title="Send to Rahim" sub="You sent ₹500 last week" />
          <SuggestCard icon="📱" title="Recharge due soon" sub="Airtel prepaid · expires in 3 days" />
          <SuggestCard icon="🎁" title="₹1000 cashback offer" sub="On bill payments above ₹500" />
        </div>
      </div>

      <MoreOptionsSheet
        open={showMore}
        onClose={() => setShowMore(false)}
        onPick={(id) => { setShowMore(false); onPickMore(id); }}
        onOpenAll={onOpenAll ? () => { setShowMore(false); onOpenAll(); } : undefined}
      />
    </div>
  );
}

function MiniBal({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl px-2 py-2 text-center">
      <p className="text-[10px] opacity-80">{icon} {label}</p>
      <p className="font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
}

function SmallBtn({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button onClick={() => { playClick(); vibrate(10); onClick?.(); }}
      className="flex-1 bg-white/15 backdrop-blur rounded-xl py-2 flex items-center justify-center gap-1 text-[11px] font-semibold active:scale-95 transition-transform">
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: LucideIcon; label: string; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={() => { playClick(); vibrate(15); onClick?.(); }}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium text-foreground">{label}</span>
    </button>
  );
}

function GameTile({ emoji, label, color, onClick }: { emoji: string; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={() => { playClick(); vibrate(15); onClick(); }}
      className={`relative overflow-hidden rounded-2xl p-2 text-white bg-gradient-to-br ${color} shadow-md active:scale-95 transition-transform aspect-square flex flex-col items-center justify-center`}>
      <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white/15 blur-md" />
      <div className="text-2xl drop-shadow">{emoji}</div>
      <p className="text-[10px] font-bold mt-1">{label}</p>
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

function OfferCard({ emoji, title, sub, color, onClick }: { emoji: string; title: string; sub: string; color: string; onClick: () => void }) {
  return (
    <button onClick={() => { playClick(); vibrate(12); onClick(); }}
      className={`relative overflow-hidden text-left rounded-2xl p-3 text-white bg-gradient-to-br ${color} shadow-card active:scale-95 transition-transform`}>
      <div className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-white/20 blur-md" />
      <div className="text-xl">{emoji}</div>
      <p className="text-sm font-bold mt-1 leading-tight">{title}</p>
      <p className="text-[10px] opacity-90 mt-0.5">{sub}</p>
    </button>
  );
}

function _SuggestCardOriginal({ icon, title, sub }: { icon: string; title: string; sub: string }) {
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

function QuickChip({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button onClick={() => { playClick(); vibrate(10); onClick(); }}
      className="shrink-0 flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm active:scale-95 transition-transform">
      <span>{emoji}</span><span>{label}</span>
    </button>
  );
}

function PendingBill({ icon: Icon, color, name, due, amount, onPay }: { icon: LucideIcon; color: string; name: string; due: string; amount: number; onPay: () => void }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{due}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">₹{amount}</p>
        <button onClick={() => { playClick(); vibrate(15); onPay(); }}
          className="text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full active:scale-95 transition-transform">
          Pay Now
        </button>
      </div>
    </div>
  );
}