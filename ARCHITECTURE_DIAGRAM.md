# 🏗️ Application Architecture

## Complete Click-to-Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME SCREEN                              │
│                    (HomeScreen.tsx)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks option
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LOGIC                                 │
│                   (src/routes/index.tsx)                         │
│                                                                   │
│  const onPickMore = (id: MoreOptionId) => {                     │
│    // Route to appropriate screen based on feature ID           │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Routes to...
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                             │
        ↓                                             ↓
┌──────────────────┐                    ┌──────────────────────┐
│  CUSTOM SCREENS  │                    │  GENERIC SCREEN      │
└──────────────────┘                    └──────────────────────┘
        │                                             │
        ├─────────────────────┐                      │
        │                     │                      │
        ↓                     ↓                      ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ BankAccount  │    │ SplitBillNew │    │ GenericFeature   │
│ Screen       │    │ Screen       │    │ Screen           │
├──────────────┤    ├──────────────┤    ├──────────────────┤
│ • Add Bank   │    │ • Split Bill │    │ • Balance        │
│ • Link A/C   │    │              │    │ • Statement      │
│              │    │              │    │ • UPI Set        │
│ Full flow:   │    │ Full flow:   │    │ • Manage ID      │
│ 1. Bank sel  │    │ 1. Contacts  │    │ • Default        │
│ 2. Account # │    │ 2. Amount    │    │ • Switch         │
│ 3. IFSC      │    │ 3. Split     │    │ • Bulk Pay       │
│ 4. OTP       │    │ 4. Confirm   │    │ • Pay Link       │
│ 5. Success   │    │ 5. Success   │    │ • Nearby         │
└──────────────┘    └──────────────┘    │ • Tap Pay        │
                                         │ • Schedule       │
┌──────────────┐                        │ • Auto Pay       │
│ ChatScreen   │                        │ • Collect        │
├──────────────┤                        │                  │
│ • Chat       │                        │ Configurable:    │
│ • Call       │                        │ 1. Form fields   │
│ • Video      │                        │ 2. Validation    │
│ • Group      │                        │ 3. Processing    │
│              │                        │ 4. Success       │
│ Features:    │                        └──────────────────┘
│ • Messaging  │
│ • Typing     │
│ • Status     │
│ • Payments   │
└──────────────┘
```

---

## 📊 Component Hierarchy

```
App (index.tsx)
│
├── PhoneFrame
│   │
│   ├── LockScreen (if locked)
│   │
│   └── Main App (if unlocked)
│       │
│       ├── HomeScreen
│       │   ├── Header (Balance, Notifications)
│       │   ├── Quick Actions
│       │   ├── Bank & Account Section (8 options)
│       │   ├── Advanced Features Section (8 options)
│       │   ├── Communication Hub (4 options)
│       │   ├── Contact & Social (6 options)
│       │   └── MoreOptionsSheet
│       │
│       ├── PayScreen
│       ├── RewardsScreen
│       ├── HistoryScreen
│       ├── ProfileScreen
│       │
│       ├── BankAccountScreen (Add Bank, Link A/C)
│       ├── SplitBillScreenNew (Split Bill)
│       ├── ChatScreen (Chat, Call, Video, Group)
│       └── GenericFeatureScreen (13 features)
│
└── BottomNav
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE VARIABLES                           │
│                   (src/routes/index.tsx)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  const [tab, setTab] = useState<Tab>("home")                │
│  const [overlay, setOverlay] = useState<...>(null)          │
│  const [moreOpt, setMoreOpt] = useState<...>(null)          │
│  const [bankAccountScreen, setBankAccountScreen] = ...      │
│  const [chatScreen, setChatScreen] = useState(false)        │
│  const [splitBillNewScreen, setSplitBillNewScreen] = ...    │
│  const [genericFeatureScreen, setGenericFeatureScreen] = ...│
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ State changes trigger
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  ANIMATEPRESENCE                             │
│                  (Framer Motion)                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  • Smooth screen transitions                                 │
│  • Slide-in animations (x: "100%" → x: 0)                   │
│  • Fade effects                                              │
│  • Exit animations                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Feature ID to Screen Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                  FEATURE ID MAPPING                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Bank & Account:                                             │
│  ├─ "add-bank"         → BankAccountScreen                  │
│  ├─ "link-account"     → BankAccountScreen                  │
│  ├─ "check-balance"    → GenericFeatureScreen               │
│  ├─ "mini-statement"   → GenericFeatureScreen               │
│  ├─ "upi-settings"     → GenericFeatureScreen               │
│  ├─ "upi-id"           → GenericFeatureScreen               │
│  ├─ "default-account"  → GenericFeatureScreen               │
│  └─ "account-switch"   → GenericFeatureScreen               │
│                                                               │
│  Advanced Features:                                          │
│  ├─ "split-bill"       → SplitBillScreenNew                 │
│  ├─ "bulk-payment"     → GenericFeatureScreen               │
│  ├─ "payment-link"     → GenericFeatureScreen               │
│  ├─ "pay-nearby"       → GenericFeatureScreen               │
│  ├─ "tap-to-pay"       → GenericFeatureScreen               │
│  ├─ "scheduled-pay"    → GenericFeatureScreen               │
│  ├─ "auto-pay"         → GenericFeatureScreen               │
│  └─ "auto-collect"     → GenericFeatureScreen               │
│                                                               │
│  Communication:                                              │
│  ├─ "chat"             → ChatScreen                         │
│  ├─ "voice-call"       → ChatScreen                         │
│  ├─ "video-call"       → ChatScreen                         │
│  └─ "group-chat"       → ChatScreen                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 GenericFeatureScreen Configuration

```
┌─────────────────────────────────────────────────────────────┐
│            FEATURE_CONFIGS OBJECT                            │
│         (GenericFeatureScreen.tsx)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  const FEATURE_CONFIGS: Record<string, FeatureConfig> = {   │
│    "check-balance": {                                        │
│      title: "Check Balance",                                 │
│      icon: "💰",                                             │
│      description: "View your account balance",               │
│      fields: [],  // No input needed                         │
│      successMessage: "Balance refreshed successfully"        │
│    },                                                         │
│    "mini-statement": {                                       │
│      title: "Mini Statement",                                │
│      icon: "📄",                                             │
│      description: "View recent transactions",                │
│      fields: [                                               │
│        { label: "Select Account", ... },                     │
│        { label: "Number of Transactions", ... }              │
│      ],                                                       │
│      successMessage: "Statement generated successfully"      │
│    },                                                         │
│    // ... 11 more configurations                             │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Type Safety

```
┌─────────────────────────────────────────────────────────────┐
│              TYPE DEFINITIONS                                │
│         (MoreOptionsSheet.tsx)                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  export type MoreOptionId =                                  │
│    // Bank & Account                                         │
│    | "add-bank" | "link-account"                            │
│    | "check-balance" | "mini-statement"                     │
│    | "upi-settings" | "upi-id"                              │
│    | "default-account" | "account-switch"                   │
│    // Advanced Features                                      │
│    | "bulk-payment" | "payment-link"                        │
│    | "pay-nearby" | "tap-to-pay"                            │
│    | "scheduled-pay" | "auto-pay"                           │
│    | "auto-collect"                                          │
│    // Communication                                          │
│    | "chat" | "voice-call"                                  │
│    | "video-call" | "group-chat"                            │
│    // ... other features                                     │
│                                                               │
│  ✅ TypeScript ensures type safety across all components    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Animation Flow

```
Screen Transition Animation:
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  1. User clicks option                                       │
│     ↓                                                         │
│  2. State changes (e.g., setGenericFeatureScreen("balance"))│
│     ↓                                                         │
│  3. AnimatePresence detects change                          │
│     ↓                                                         │
│  4. Exit animation on current screen                         │
│     • opacity: 1 → 0                                         │
│     • x: 0 → -20                                             │
│     ↓                                                         │
│  5. Enter animation on new screen                            │
│     • initial: { x: "100%" }                                 │
│     • animate: { x: 0 }                                      │
│     • transition: { duration: 0.25, ease: [0.22, 1, ...] }  │
│     ↓                                                         │
│  6. Screen fully visible                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS BUTTON                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SOUND & HAPTIC                            │
│  • playClick() - Click sound effect                          │
│  • vibrate(15) - Haptic feedback                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION                                │
│  • onPickMore(featureId) called                             │
│  • State updated                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN OPENS                              │
│  • Slide-in animation                                        │
│  • Form displayed (if needed)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER FILLS FORM                           │
│  • Input validation                                          │
│  • Required field checks                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING                                │
│  • Loading spinner (2 seconds)                               │
│  • Simulated backend call                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUCCESS SCREEN                            │
│  • playSuccess() - Success sound                             │
│  • vibrate([20, 30, 20]) - Success haptic                   │
│  • Confirmation details                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACK TO HOME                              │
│  • User clicks "Done"                                        │
│  • Slide-out animation                                       │
│  • Returns to HomeScreen                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Reusability

```
┌─────────────────────────────────────────────────────────────┐
│              REUSABLE COMPONENTS                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GenericFeatureScreen                                        │
│  ├─ Used by 13 different features                           │
│  ├─ Configurable via FEATURE_CONFIGS                        │
│  └─ Reduces code duplication                                │
│                                                               │
│  QuickAction (HomeScreen)                                    │
│  ├─ Used for all icon buttons                               │
│  ├─ Consistent styling                                       │
│  └─ Reused 40+ times                                         │
│                                                               │
│  Field (GenericFeatureScreen)                                │
│  ├─ Form input wrapper                                       │
│  ├─ Consistent label styling                                │
│  └─ Used for all form fields                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 ARCHITECTURE BENEFITS

✅ **Scalability**: Easy to add new features
✅ **Maintainability**: Reusable components reduce duplication
✅ **Type Safety**: TypeScript ensures correctness
✅ **Performance**: Efficient state management
✅ **User Experience**: Smooth animations and feedback
✅ **Code Organization**: Clear separation of concerns
✅ **Flexibility**: Configurable components

---

**Status**: ✅ Architecture implemented and working
**Ready for**: ✅ Production use and further enhancements
