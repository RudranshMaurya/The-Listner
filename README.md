# The Listener — Full-Stack Conversation & Listening SaaS Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange.svg)](https://firebase.google.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-Audio_Calling-green.svg)](https://webrtc.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-teal.svg)](https://tailwindcss.com)

> **"Sometimes, you don't need advice. You just need someone who listens."**  
> *"Your feelings deserve a safe space. Talk freely. Be heard. Never feel judged."*

The Listener connects **Talkers** (people who want to share their feelings, thoughts, and situations without judgment) with **Listeners** (vetted individuals who earn money by listening respectfully).

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    The Listener Web App (React/TS)   │
                      │  - Apple-Inspired Minimalist Design  │
                      │  - Talker & Listener Dashboards      │
                      │  - WebRTC Real-Time Audio Calling    │
                      │  - Dynamic UPI QR Code Generator     │
                      │  - Private Protected Admin Console   │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌───────────────────────────────────┐
│     Firebase Cloud Backend      │             │  MacroDroid Gateway (Python 5050) │
│  - Firebase Authentication      │             │  - Port 5050 (0.0.0.0)            │
│  - Firebase Realtime Database   │◄────────────┤  - Compatible /notify Endpoint    │
│  - TypeScript Cloud Functions   │  (HMAC API) │  - UTR & Amount Regex Extractor   │
│  - Integer Paise Ledger Engine  │             │  - SQLite Audit Log & Deduplicator│
└─────────────────────────────────┘             └─────────────────▲─────────────────┘
                                                                  │
                                                ┌─────────────────┴─────────────────┐
                                                │ Android Device (MacroDroid Macro) │
                                                │ - Bank / GPay / PhonePe / FamPay  │
                                                │   Payment Notification Listener   │
                                                └───────────────────────────────────┘
```

---

## 📁 Project Directory Structure

```
The listner/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable Apple-inspired UI design tokens
│   │   │   ├── Button.tsx      # Variants: primary, secondary, outline, ghost, danger
│   │   │   ├── Card.tsx        # Rounded cards with subtle borders & soft shadows
│   │   │   ├── Badge.tsx       # Live status indicators: idle, busy, listening, verified
│   │   │   ├── Input.tsx       # Clean input fields and textareas
│   │   │   ├── Modal.tsx       # Accessible dialogs with backdrop blur
│   │   │   ├── Toast.tsx       # Toast notifications stack
│   │   │   ├── Skeleton.tsx    # Shimmer loading states
│   │   │   ├── EmptyState.tsx  # Empty view handlers
│   │   │   ├── StarRating.tsx  # 5-star interactive rating component
│   │   │   └── Navbar.tsx      # Sticky glass navigation bar
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx   # Public layout with emergency helpline banners & footer
│   │   │   ├── DashboardLayout.tsx # Dual Talker & Listener dashboard shell
│   │   │   └── AdminLayout.tsx # Private supervisory console layout
│   │   ├── talker/
│   │   │   ├── ListenerCard.tsx# Clickable cards with rating, price, and status
│   │   │   ├── BookingModal.tsx# Date & time slot reservation
│   │   │   └── TopupModal.tsx  # Dynamic UPI QR code generator for rudransh-maurya@fam
│   │   ├── listener/
│   │   │   └── WithdrawalModal.tsx # UPI earnings payout workflow (min ₹200)
│   │   └── communication/
│   │       ├── SessionTimer.tsx# Trusted billing timer & low-balance warnings
│   │       └── ReviewModal.tsx # 5-star reviews & tag highlights
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Google popup sign-in, persistence, and RBAC
│   │   ├── ThemeContext.tsx    # Apple light & dark mode toggle with system preference
│   │   ├── NotificationContext.tsx # Real-time in-app alerts
│   │   └── CommunicationContext.tsx# WebRTC audio signals & incoming call popups
│   ├── lib/
│   │   ├── firebase.ts         # Modular Firebase SDK v11 initialization
│   │   ├── database.ts         # Realtime Database typed services and auto-seed
│   │   ├── billing.ts          # Integer paise calculations: ₹5 per 120s (₹2.50/min)
│   │   ├── webrtc.ts           # Browser-to-browser audio calling with RTDB signaling
│   │   └── upi.ts              # Strictly compliant UPI URI builder
│   ├── pages/
│   │   ├── public/             # Landing, How It Works, Explore, Terms, Privacy
│   │   ├── auth/               # Login, Signup, Role Selection (Talker vs Listener)
│   │   ├── onboarding/         # 18+ policy, multi-step wizard, qualification test
│   │   ├── talker/             # Dashboard, directory, profile, wallet, appointments
│   │   ├── listener/           # Dashboard, schedule, earnings, wallet, reviews
│   │   ├── session/            # Live text chat room & WebRTC audio room
│   │   └── admin/              # User directory, reconciliation, payouts, audit logs
│   ├── types/index.ts          # Strictly typed schemas
│   ├── App.tsx                 # Route tree with protected role guards
│   ├── index.css               # Tailwind CSS v4 custom rules
│   └── main.tsx                # React entry point
├── functions/                  # Firebase Cloud Functions in TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts            # Atomic billing settlement & webhook endpoints
├── python_gateway/             # MacroDroid payment receiver
│   ├── notification_server.py  # 100% backward-compatible port 5050 server
│   └── README.md
├── database.rules.json         # Production Firebase Realtime Database Security Rules
├── firebase.json               # Firebase CLI hosting, RTDB, and functions deploy config
├── .firebaserc                 # Project therapy-1e39d binding
├── .env.example                # Safe environment variable template
└── README.md
```

---

## ⚡ Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- Python 3.8+ (for the MacroDroid gateway)
- Firebase CLI (`npm install -g firebase-tools`)

### 2. Frontend Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 💳 UPI Payment & Wallet Engine

### Payment Destination
All wallet top-up QR codes are generated dynamically for:
- **VPA:** `rudransh-maurya@fam`
- **Payee Name:** `The Listener`
- **Standard URI:**
  ```text
  upi://pay?pa=rudransh-maurya@fam&pn=The%20Listener&am=100.00&cu=INR&tr=TL-XXXXXX&tn=Wallet%20Topup
  ```

### MacroDroid Notification Gateway (Port 5050)
The Python server preserves **100% backward compatibility** with your existing MacroDroid macro:
```bash
python3 python_gateway/notification_server.py
```
- **Port:** `5050`
- **Incoming MacroDroid URL:**
  ```text
  http://<LOCAL_IP>:5050/notify?text={notification}
  ```
- **Response:**
  ```json
  {
    "status": "received",
    "time": "2026-11-09 18:00:00"
  }
  ```
- **Security Check:** To prevent false credits, notifications are matched against unique pending top-up orders (`TL-XXXXXX`) and verified in the Admin Console before atomic wallet balance updates occur.

---

## 💰 Pricing & Billing Rules

1. **Default Platform Rate:** **₹5 for every 2 minutes** of conversation (equivalent to **₹2.50 per minute**).
2. **Integer Paise Calculation:** All calculations use integer paise internally (`1 Rupee = 100 paise`, `₹5.00 = 500 paise`) to prevent floating-point financial discrepancies.
3. **Active-Only Billing:** The billing timer starts **only** after both participants have accepted the session and are active.
4. **Listener Minimum Withdrawal:** **₹200** (20,000 paise). Listeners can request payouts to their private UPI ID once their withdrawable balance reaches ₹200.

---

## 🔒 Security & Firebase Rules

- **Database Rules:** Configured in `database.rules.json`. Ordinary users cannot directly alter wallet balances, self-verify, or escalate privileges.
- **Admin Control:** Protected route `/admin` restricted to verified administrators (`admin/config/admins/{uid}` or role `admin`).
- **Data Privacy:** Listener UPI IDs and private banking notes are kept strictly separate from public profile cards.

---

## 🚀 Firebase Deployment Guide

```bash
# 1. Log in to Firebase
firebase login

# 2. Select the existing Firebase project
firebase use therapy-1e39d

# 3. Deploy Database Security Rules
firebase deploy --only database

# 4. Deploy Frontend to Firebase Hosting
npm run build
firebase deploy --only hosting

# 5. Deploy Cloud Functions (Requires Firebase Blaze Plan)
firebase deploy --only functions
```

---

## 🧪 Tested End-to-End Workflows

- ✅ **Google Authentication:** Sign in with Google popup, role determination, session persistence.
- ✅ **Role Onboarding:** Selection between Talker and Listener; 18+ policy check.
- ✅ **Listener Verification:** 5-question active listening questionnaire with score threshold (≥ 80%) awarding the green Platform-Verified badge.
- ✅ **Live Directory:** Real-time listener status transitions (`Available Now` ↔ `Busy` ↔ `In Conversation`).
- ✅ **Real-Time Text Chat:** Messages, typing indicators, delivery timestamps associate with session ID.
- ✅ **WebRTC Audio Calling:** Peer-to-peer audio connection with STUN signaling, mute/unmute, and mic permissions.
- ✅ **Dynamic UPI QR Code:** Generates standard UPI URI for `rudransh-maurya@fam`.
- ✅ **MacroDroid Gateway Compatibility:** Verified both GET and POST requests on port 5050 with exact JSON response.
- ✅ **Listener Payouts:** Validates ₹200 minimum threshold, reserves funds, alerts admin, and records UTR references.
- ✅ **Private Admin Center:** User directory, active session monitoring, payment candidate matching, and immutable audit logs.
