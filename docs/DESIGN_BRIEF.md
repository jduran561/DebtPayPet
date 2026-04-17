# DebtPet — Design Brief

## What the App Does

DebtPet is a gamified debt tracker. Users manually enter their debts and make payments. As they pay down debt, their virtual pet "Penny" evolves through 5 stages. The goal is to make the emotionally difficult process of paying off debt feel fun and motivating.

**Target user:** Someone overwhelmed by debt who wants a simple, encouraging tool — not a spreadsheet, not a bank app.

**Core loop:** Add debt → Log payments → Earn XP → Watch Penny grow → Feel motivated to keep going

---

## App Structure (Screens)

| Tab | What's on It |
|-----|-------------|
| **Dashboard** | Pet display + debt overview side by side, quick debt list |
| **Debts** | Full list of debts, make payment button, progress bars |
| **Strategy** | Toggle between Avalanche / Snowball payoff methods + tips |
| **Settings** | Notification reminder preferences |

**Modals:**
- Add Debt (form: name, category, balance, interest rate, minimum payment, due day)
- Make Payment (amount input, payment type: minimum / extra / lump sum)

---

## Brand Colors

### Primary Brand
| Name | Hex | Use |
|------|-----|-----|
| Primary | `#6366f1` | Buttons, active tabs, links, progress bars |
| Secondary | `#8b5cf6` | Gradients paired with primary |
| Accent | `#f59e0b` | Highlights, badges, call-to-action |

### Penny Evolution Colors (egg → legendary)
| Stage | Hex | Vibe |
|-------|-----|------|
| Egg | `#f5e6d3` | Warm beige — potential, mystery |
| Hatchling | `#a8d5ba` | Soft mint — new life, early wins |
| Juvenile | `#7fb069` | Fresh green — momentum, growing |
| Adult | `#2d6a4f` | Deep forest green — strength, confidence |
| Legendary | `#9d4edd` | Royal purple — triumph, debt-free |

### Status Colors
| Name | Hex | Meaning |
|------|-----|---------|
| Danger | `#ef4444` | High interest, overdue |
| Warning | `#f59e0b` | Needs attention |
| Good | `#22c55e` | On track |
| Paid | `#06b6d4` | Cleared (cyan) |

---

## Typography

Currently using system/browser defaults via Tailwind CSS. No custom font set yet — open to designer recommendation.

**Text sizes in use:**
- Hero numbers (total debt): `text-4xl font-bold`
- Section headings: `text-xl font-bold`
- Card labels: `text-sm`, `text-xs text-gray-500`
- Pet name: `text-2xl font-bold`

---

## Current UI Patterns

**Cards:** White background, `rounded-2xl`, `shadow-lg`, `p-6`

**Buttons (primary):** `bg-brand-primary (#6366f1)`, white text, `rounded-lg`, hover darkens

**Progress bars:**
- Evolution XP bar: tall (`h-3`), indigo-to-purple gradient
- Happiness bar: thin (`h-2`), yellow
- Health bar: thin (`h-2`), green
- Debt payoff bar: thin, green

**Background:** Light gray gradient (`from-gray-50 to-gray-100`)

**Tabs:** Border-bottom highlight in brand-primary when active

---

## Pet: Penny

Penny is the heart of the app. Currently uses emoji as placeholders — **this is the #1 thing we want to redesign.**

### The 5 Stages

| Stage | Current Emoji | XP Required | Description |
|-------|--------------|-------------|-------------|
| Egg | 🥚 | 0 XP | A mysterious egg full of potential |
| Hatchling | 🐣 | 100 XP | A tiny creature taking its first steps |
| Juvenile | 🐲 | 500 XP | Growing stronger with every payment |
| Adult | 🐉 | 2,000 XP | A powerful ally in your debt journey |
| Legendary | ✨🐉✨ | 10,000 XP | A legendary dragon, debt destroyer! |

### Penny's Moods (5 states)
These are displayed alongside the pet with a text-based face currently:

| Mood | Trigger | Current Display |
|------|---------|----------------|
| Ecstatic | Wellbeing ≥ 90% | `(^o^)` |
| Happy | Wellbeing ≥ 70% | `(^_^)` |
| Content | Wellbeing ≥ 50% | `(-_-)` |
| Worried | Wellbeing < 50% or inactive 7+ days | `(o_o)` |
| Sad | Wellbeing < 30% | `(T_T)` |

### Penny's Stats (shown as progress bars)
- **Evolution Progress** — XP toward next stage
- **Happiness** — Goes up with payments, down with inactivity
- **Health** — Affected by staying on track

---

## Pet Display Component Layout

```
┌─────────────────────────────┐
│   [PENNY AVATAR — circle]   │  ← colored circle, emoji inside, pulsing
│        Penny                │  ← name (user can rename)
│       Egg Stage             │  ← current stage
│  "A mysterious egg..."      │  ← stage description
│                             │
│     (^_^) Feeling good!     │  ← mood face + reason
│                             │
│ Evolution ████░░░░  45 XP   │  ← XP progress bar
│ Happiness  █████░░  72%     │  ← happiness bar
│ Health     ██████░  85%     │  ← health bar
│                             │
│    Lifetime XP: 1,234       │
└─────────────────────────────┘
```

---

## Debt Card Layout

```
┌─────────────────────────────────────────┐
│ 💳 My Visa Card          TARGET  [trash]│
│ $4,200 remaining of $5,000              │
│ ████████████░░░░░░░░  84% paid         │
│                                         │
│ Min. $85/mo  •  18.99%  •  Due: 15th   │
│                                         │
│              [Make Payment]             │
└─────────────────────────────────────────┘
```

---

## Debt Categories (with emoji, could become icons)

| Category | Emoji |
|----------|-------|
| Credit Card | 💳 |
| Student Loan | 🎓 |
| Auto Loan | 🚗 |
| Personal Loan | 💰 |
| Medical | 🏥 |
| Mortgage | 🏠 |
| Other | 📋 |

---

## App Icon Direction

The icon should communicate:
- Dragon / creature (Penny)
- Growth / hope
- Finance (subtle, not corporate)

Currently no icon — just browser default. Open to suggestions.

---

## What We're Asking For

**Priority 1 — Penny Character Design:**
- Custom illustrations for all 5 evolution stages (egg → legendary dragon)
- Each stage should feel like a meaningful transformation
- Style should be friendly, slightly kawaii/cute, not intimidating
- Also need 5 mood variants for the adult or legendary stage (or all stages if budget allows)
- Delivered as SVG or transparent PNG

**Priority 2 — App Icon:**
- Should feature Penny (probably legendary or adult stage)
- Works at small sizes (29x29px) and large (1024x1024px)
- Consistent with brand colors

**Nice to have:**
- Debt category icons (replacing emojis)
- Evolution celebration animation concept
- Empty state illustrations

---

## Tech Notes for Designers

- Built with React + Tailwind CSS
- Images can be SVG (preferred for scalability) or PNG with transparency
- Pet is displayed in a circle container — artwork should work centered in a circle
- App is web-first, mobile-responsive (not a native app yet)
