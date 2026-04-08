# DebtPayPet: From Personal Project to Published App

## Context

DebtPayPet at `/Users/jduran/Github/DebtPayPet` is a gamified debt tracking app built with React 19 + TypeScript + Vite + Zustand + Capacitor. It already has a full feature set (debt CRUD, avalanche/snowball strategies, virtual pet "Penny" with evolution, achievements, dark/light theme). The goal is to turn this into a real app on the App Store that people can use, and to set up multi-agent AI workflows in Cursor to accelerate development.

---

## Key Architectural Decisions

| Decision | Recommendation | Why |
|----------|---------------|-----|
| **Backend** | Stay local-only for v1 | Privacy advantage for a finance app, zero server costs, no auth complexity. Add Supabase later for sync in v2. |
| **Storage** | Migrate to `@capacitor/preferences` | More reliable than raw localStorage on mobile devices |
| **Monetization** | Freemium ($2.99 one-time unlock) | No ads in a finance app. Free: 3 debts + basic pet. Paid: unlimited debts, all pet features, data export |
| **Platform** | iOS first via TestFlight, Android second | TestFlight makes beta testing easy; Google Play can follow |
| **Testing** | Stores first, 60%+ before App Store | Financial calculation accuracy is non-negotiable |

---

## Phase 1: Cursor Multi-Agent Setup (Day 1)

Create 5 files to establish specialized AI agents in Cursor:

### `.cursorrules` (project root)
Global context all agents see: project description, tech stack, conventions, file structure, rule that agents stay in their scope.

### `cursor-agents/frontend-agent.md` ("Penny")
- **Scope:** `src/components/**`, `src/App.tsx`, `src/App.css`, `src/index.css`
- **Job:** UI components, styling, animations, accessibility
- **Rules:** Don't touch stores, types, or tests. Use existing Tailwind theme. Follow domain-based folder structure.

### `cursor-agents/logic-agent.md` ("Vault")
- **Scope:** `src/store/**`, `src/hooks/**`, `src/types/**`
- **Job:** Business logic, state management, TypeScript types
- **Rules:** Don't touch components or CSS. Maintain backwards compatibility with persisted data. No side effects in stores.

### `cursor-agents/test-agent.md` ("Shield")
- **Scope:** `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/test-setup.ts`
- **Job:** Writing and maintaining tests
- **Rules:** Don't modify app source code. Mock dates/UUIDs. Reset store state between tests.

### `cursor-agents/platform-agent.md` ("Bridge")
- **Scope:** `capacitor.config.ts`, `ios/**`, `android/**`, `vite.config.ts`, `package.json`
- **Job:** Capacitor config, native builds, plugin integration
- **Rules:** Don't modify app source. Run `npm run build` before `cap sync`.

### How to use day-to-day
1. Open Cursor Composer tab (Cmd+I)
2. Tell it which agent it is: "You are the Test Agent. Follow `cursor-agents/test-agent.md`."
3. One agent per Composer session. Never mix roles.
4. If an agent needs work outside its scope, it documents the request for you to hand off.

---

## Phase 2: Test Foundation + Stability (Days 2-3)

### 2A. Complete the thin test layer (15-20 tests)
Using the Test Agent in Cursor:
- **`useDebtStore` tests:** payment math, balance floor at 0, sorting by avalanche/snowball, total calculations, payment streak logic
- **`usePetStore` tests:** XP accumulation, evolution threshold crossing, multi-stage jumps, progress calculation, mood logic
- Files already started: `src/store/useDebtStore.test.ts`, `src/store/usePetStore.test.ts`
- Run: `npm test`

### 2B. Error boundary
Using the Frontend Agent:
- Create `src/components/ErrorBoundary.tsx` wrapping `<App />`
- Shows a recovery screen instead of white screen on crash

### 2C. Store versioning
Using the Logic Agent:
- Add `version` field to each Zustand persist config
- Add migration functions so future schema changes don't destroy user data
- Migrate from raw `localStorage` to `@capacitor/preferences` for native reliability

---

## Phase 3: Production Hardening (Week 2-3)

### 3A. Decompose DebtList.tsx (33KB / ~900 lines)
Split into: `DebtCard.tsx`, `PaymentModal.tsx`, `DebtListHeader.tsx`, `PaidOffSection.tsx`

### 3B. Expand test coverage to 60%+
- Component tests for `AddDebtForm` (validation, submission)
- Component tests for `DebtList` (rendering, payment flow)
- Persistence tests (Date serialization round-trip)

### 3C. Production observability
- Sentry for crash reporting (`@sentry/capacitor`)
- Basic analytics (privacy-respecting: Plausible or PostHog self-hosted)

### 3D. Mobile UX polish
- Haptic feedback on payments (`@capacitor/haptics`)
- Verify safe area insets on header and nav
- Test keyboard behavior on all forms
- Pull-to-refresh on dashboard

### 3E. Data safety
- JSON export/import for user data backup
- Data validation on store hydration (protect against corrupted storage)

---

## Phase 4: App Store Submission (Week 4-5)

### 4A. Apple Developer Account
- Sign up at developer.apple.com ($99/year)
- Account approval can take up to 48 hours

### 4B. App Store assets
- **App icon:** 1024x1024 source (use AI image gen for Penny the dragon on a coin/penny)
- Generate all sizes with `npx @capacitor/assets generate`
- **Screenshots:** Capture on simulator for iPhone 6.7" and 6.1"
- **App description + keywords**
- **Privacy policy:** Simple page on GitHub Pages stating local-only storage, no data collection
- **Support URL:** GitHub Pages or repo link

### 4C. TestFlight beta
- Open `ios/App/App.xcworkspace` in Xcode
- Set up signing with Apple Developer account
- Build → Archive → Upload to App Store Connect → TestFlight
- Install on your iPhone, use with real debts for 1-2 weeks

### 4D. App Store submission
- After TestFlight testing period, submit for review
- Address any rejection feedback

### 4E. Android (parallel or after iOS)
- Google Play Developer account ($25 one-time)
- Generate signed AAB via Android Studio
- Similar assets: 512x512 icon, 1024x500 feature graphic, screenshots

---

## Phase 5: Post-Launch Backlog

- Push notifications via `@capacitor/push-notifications`
- Debt payoff progress charts
- Freemium unlock via in-app purchases (RevenueCat SDK)
- iOS widget (WidgetKit)
- Cross-device sync with Supabase (v2.0)

---

## This Week's Schedule

| Day | Task | Agent |
|-----|------|-------|
| Day 1 | Create `.cursorrules` + 4 agent instruction files | Claude Code (this session) |
| Day 2 | Write 15-20 unit tests for stores | Test Agent in Cursor |
| Day 3 | Error boundary + store versioning + `@capacitor/preferences` migration | Frontend + Logic Agents |
| Day 4 | Generate app icon + sign up for Apple Developer Program | You (manual) |
| Day 5 | First TestFlight build | Platform Agent + Xcode |
| Weekend | Use the app with your real debts, take notes | You |

---

## Verification

- `npm test` passes with 15+ tests after Phase 2
- `npm run build` produces clean output with no errors
- App installs and runs on iPhone via TestFlight after Phase 4
- All 4 Cursor agent files exist and are usable in Composer sessions

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `.cursorrules` | Create (project root) |
| `cursor-agents/frontend-agent.md` | Create |
| `cursor-agents/logic-agent.md` | Create |
| `cursor-agents/test-agent.md` | Create |
| `cursor-agents/platform-agent.md` | Create |
| `src/components/ErrorBoundary.tsx` | Create |
| `src/store/useDebtStore.ts` | Modify (add version + migration) |
| `src/store/usePetStore.ts` | Modify (add version + migration) |
| `src/store/useDebtStore.test.ts` | Modify (expand tests) |
| `src/store/usePetStore.test.ts` | Modify (expand tests) |
| `src/components/debt/DebtList.tsx` | Decompose into 4 files |
| `capacitor.config.ts` | Modify (add plugins) |
| `src/main.tsx` | Modify (wrap with ErrorBoundary) |
