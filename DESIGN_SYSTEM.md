# The Listener — Apple-Style Design System

A compact, centralized, and minimal front-end design system inspired by Apple Human Interface Guidelines. Engineered for simplicity, calm aesthetics, high legibility, and effortless re-theming across desktop, tablet, and mobile (360px+).

---

## 1. Quick Start: Re-Theming with One Value

The entire platform's interactive brand identity is controlled by **one single token** (`--accent` and dark mode counterpart) located at the very top of `src/index.css`:

```css
:root {
  /* Change this single value to instantly re-theme the entire platform */
  --accent: #0071E3;          /* Apple System Blue */
  --accent-contrast: #FFFFFF;
}

.dark {
  --accent: #2997FF;          /* High-legibility Apple Blue for dark surfaces */
}
```

*Changing `--accent` automatically updates:*
- Primary buttons, active tabs, and navigation focus indicators
- Dynamic status pills, radio checkmarks, and selected role cards
- Focus rings, form input focus borders, and active filter chips
- Audio waveform visualizers and avatar call rings

---

## 2. Design Tokens Reference

All design tokens are defined in `src/index.css` via native CSS variables mapped into Tailwind CSS utilities.

### 2.1 Color Palette (Apple Neutrals + 1 Accent)

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#FBFBFD` | `#000000` | Application root canvas background |
| `--surface` | `#F5F5F7` | `#1C1C1E` | Card containers, topbars, sheets, dropdowns |
| `--surface-raised` | `#FFFFFF` | `#2C2C2E` | Modals, active elevated cards, popovers |
| `--border` | `#E8E8ED` | `#2C2C2E` | Subtle 1px dividers and card boundaries |
| `--text` | `#1D1D1F` | `#F5F5F7` | Primary headlines, titles, active labels (WCAG AA > 4.5:1) |
| `--text-muted` | `#6E6E73` | `#98989D` | Secondary support text, captions, hints |
| `--accent` | `#0071E3` | `#2997FF` | The single platform accent and interactive brand hue |
| `--accent-contrast`| `#FFFFFF` | `#FFFFFF` | Text color on primary accent backgrounds |
| `--success` | `#30D158` | `#30D158` | Available status, successful payments, approvals |
| `--warning` | `#FF9F0A` | `#FF9F0A` | Pending verifications, low balance warnings, notices |
| `--danger` | `#FF453A` | `#FF453A` | End session, decline call, report, error alerts |

### 2.2 Typography Scale

Using the system native font stack: `Inter, -apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

| Class | Font Size | Weight | Letter Spacing | Line Height | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.text-display` | `3.5rem` (56px) | `600` | `-0.035em` | `1.05` | Hero greetings, main display titles |
| `.text-title` | `2rem` (32px) | `600` | `-0.025em` | `1.15` | Section headers, page titles |
| `.text-heading` | `1.5rem` (24px) | `600` | `-0.02em` | `1.2` | Card headers, modal headlines |
| `.text-body` | `1.0625rem` (17px) | `400` / `500` | Normal | `1.45` | Standard reading copy, chat bubbles |
| `.text-small` | `0.875rem` (14px) | `400` / `500` | Normal | `1.4` | Form inputs, metadata labels, subtexts |
| `.text-caption` | `0.75rem` (12px) | `400` / `500` | Normal | `1.35` | Timestamps, micro-badges, hints |

### 2.3 Radii, Spacing & Shadows

- **Spacing Grid:** 8px base grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Radii:**
  - `rounded-input` (`12px`): Form inputs, textareas, select menus.
  - `rounded-card` (`20px`): Standard cards, listener cards, list rows.
  - `rounded-card-lg` (`28px`): Modals, hero blocks, sheets.
  - `rounded-pill` (`9999px`): Buttons, search bars, filter tags, badge dots.
- **Shadows:**
  - `shadow-soft`: `0 2px 10px rgba(0, 0, 0, 0.04)` (clean surface separation without heavy drops).
  - `shadow-soft-lg`: `0 12px 36px rgba(0, 0, 0, 0.08)` (modals and action sheets).
  - *No neon glows, gradient washes, or harsh black borders.*

---

## 3. Core Component Library

All components reside in `src/components/common/` and strictly consume tokens without hardcoded values:

| Component | Path | Key Props | Description |
| :--- | :--- | :--- | :--- |
| **Button** | `src/components/common/Button.tsx` | `variant` (`primary`, `secondary`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`) | Full pill-radius button with 44px min touch target, subtle active press motion, and accessible focus outlines. |
| **Card** | `src/components/common/Card.tsx` | `variant` (`default`, `raised`, `flat`, `outline`), `padding` (`none`, `sm`, `md`, `lg`), `hover` | 20px radius surface container with clean background fill. |
| **Input / Textarea** | `src/components/common/Input.tsx` | `label`, `error`, `helperText`, `leftIcon`, `rightIcon` | 12px radius, neutral background, smooth accent focus ring. Includes re-exported `Textarea`. |
| **Badge / StatusDot**| `src/components/common/Badge.tsx` | `variant` (`neutral`, `accent`, `success`, `warning`, `danger`), `size` | Compact pill tags and animated presence dots. |
| **Modal** | `src/components/common/Modal.tsx` | `isOpen`, `onClose`, `title`, `size` | Centered backdrop sheet with `rounded-card-lg` (28px), backdrop blur, and escape key listener. |
| **EmptyState** | `src/components/common/EmptyState.tsx` | `icon`, `title`, `description`, `action`, `actionLabel`, `onAction` | Calm, single-sentence actionable empty state. |
| **Navbar** | `src/components/common/Navbar.tsx` | — | Slim translucent top navigation bar with Apple backdrop blur, single unified credits pill, and user avatar dropdown. |
| **BottomNav** | `src/components/layout/BottomNav.tsx`| — | Mobile-only slim glass tab bar (Home, Explore, Conversations, Wallet, Settings) with 44px touch targets. |
| **ListenerCard** | `src/components/talker/ListenerCard.tsx` | `listener`, `onSelect`, `isOnline` | Minimal profile card showing verified badge, bio, language chips, transparent `₹2.50/min` rate, and one primary action. |
| **SessionTimer** | `src/components/communication/SessionTimer.tsx` | `startedAt`, `endedAt`, `type` | Clean timer displaying elapsed duration (e.g. `14:20`) and minutes passed only (no money distraction). |

---

## 4. Summary of Merged & Eliminated Elements

1. **Eliminated Scattered Palettes:**
   - Removed arbitrary warm orange `#D4A373`, `#FAF6F0`, `#272420`, `#332E28` and multiple mismatched Tailwind color classes (`bg-stone-50`, `bg-amber-500`, `bg-emerald-600`, `bg-indigo-600`, `bg-purple-600`).
   - Reduced CSS output bundle from **83.2 kB** down to **46.28 kB** (44% bundle size reduction).
2. **Eliminated Redundant Balance / Credits Displays:**
   - Previously, talker balance was duplicated simultaneously in the Navbar (`₹0.00 +`), in a prominent Dashboard Top Banner, in the desktop sidebar, and on the wallet page.
   - Refactored so the credit balance is rendered cleanly in the top bar pill and on the dedicated Credits & Top-up screen.
3. **Removed Fake Discounts & Astrotalk Gimmicks:**
   - Removed fake strikethrough pricing (`~~₹27~~ ₹2.50/min`) and "50% Cashback!" yellow discount banners.
   - Replaced with calm, honest, transparent rate display (`₹2.50/min`).
4. **Cleaned Call/Chat Interface:**
   - Removed intrusive live monetary counters (`₹0.00 / ₹4.50`) during active emotional sessions.
   - Replaced with an elegant minutes-passed indicator (`Duration: MM:SS · X mins passed`).
5. **Replaced Heavy Sidebars with Unified Top/Bottom Navigation:**
   - Removed cumbersome 260px desktop sidebars on Talker & Listener portals.
   - Implemented slim, modern Apple-style horizontal sub-navigation for desktop and a sticky 44px glass bottom tab bar for mobile.

---

## 5. "Needs Decision" List (Visual Items Tied to Backend / Product Logic)

The following items are preserved without alteration to strictly respect the **"DO NOT CHANGE FUNCTIONALITY"** rule:

1. **Dual Status Indicators (`isAvailable` vs `presenceStatus`):**
   - *Current Implementation:* Listeners have both a toggle switch in the UI (`isAvailable`) and an automated Firebase Realtime Database presence heartbeat (`presenceStatus === 'online'`).
   - *Design Proposal:* Unify into a single Apple-style presence pill ("Available" / "Unavailable") that syncs browser lifecycle with the manual toggle.
   - *Decision Needed:* Should closing the tab immediately set `isAvailable: false` in Firestore, or keep the talker's toggle state persistent until manually modified?
2. **Role Lock Post-Registration:**
   - *Current Implementation:* If a user signed up as a Talker, the top nav does not show "Become a Listener", and users cannot switch roles without administrative intervention or re-login.
   - *Design Proposal:* A future dual-role toggle under Settings ("Switch to Listener Profile") if users should be permitted to participate in both modes with a unified wallet.
   - *Decision Needed:* Will listeners and talkers require distinct KYC verification requirements before role switching is unlocked?
3. **Manual vs Instant UPI Verification Hook:**
   - *Current Implementation:* The Top-up modal displays dynamic UPI QR and accepts UTR references for manual admin approval (`/admin/payments`).
   - *Design Proposal:* Automatic webhook payment gateway (e.g. Razorpay / Cashfree) with instantaneous credit reconciliation.
   - *Decision Needed:* Selection of production payment aggregator to deprecate manual UTR entry while keeping the modal styling intact.
