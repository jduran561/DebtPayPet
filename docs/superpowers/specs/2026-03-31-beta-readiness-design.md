# DebtPayPet — Beta Readiness Design

**Date:** 2026-03-31
**Goal:** Get the app installed and running on Juan's iPhone via TestFlight, with a thin test layer protecting critical data before personal beta use.

---

## Scope

Two sequential tracks:

1. **Thin Test Layer** — unit tests covering critical business logic (payment math, pet evolution)
2. **iOS Beta Pipeline** — Xcode signing, build, TestFlight upload, install on device

This is a personal beta phase. The bar is: app works on device, data persists correctly, core mechanics (payments, XP, evolution) are verified. Full quality gate and public release come in a later phase.

---

## Track 1: Thin Test Layer

### Why

The app persists debt balances and Penny's XP/evolution to localStorage (and device storage on iOS). A silent bug in payment math or evolution thresholds could corrupt data once Juan starts logging real debts. A small test investment now protects that.

### Setup

- Install dev dependencies: `vitest`, `@testing-library/react`, `jsdom`
- Add `vitest.config.ts` (extends existing Vite config, sets `environment: 'jsdom'`)
- Add `src/test/setup.ts`:
  - Mock `localStorage`
  - Mock `crypto.randomUUID`
  - Reset all Zustand stores to initial state before each test

### Tests: `useDebtStore`

| Test | What it verifies |
|------|-----------------|
| `addPayment` reduces `currentBalance` by payment amount | Financial accuracy |
| `addPayment` does not let balance go below zero | Overpayment guard |
| `getSortedDebts` returns highest-interest first (avalanche) | Correct payoff priority |
| `getSortedDebts` returns lowest-balance first (snowball) | Correct payoff priority |
| `getTotalDebt` sums all current balances | Dashboard accuracy |

### Tests: `usePetStore`

| Test | What it verifies |
|------|-----------------|
| `addXp` increases both `xp` and `totalXpEarned` | XP accumulation |
| `checkEvolution` advances stage at threshold (egg → hatchling at 100 XP) | Core gamification |
| `checkEvolution` does not evolve past legendary | Boundary guard |
| `getProgressToNextStage` returns correct 0–100 percentage | Progress bar accuracy |

**Target:** ~15–20 focused unit tests. No component tests, no persistence tests in this phase.

---

## Track 2: iOS Beta Pipeline

### Prerequisites

- Mac with Xcode installed ✅
- Apple Developer account ($99/year) — **not yet active; Juan will sign up when ready**

### Steps

1. **Register Apple Developer account** at developer.apple.com
   - Creates access to App Store Connect and provisioning portal

2. **Configure bundle ID**
   - Bundle ID: `com.jduran.debtpaypet`
   - Register in Apple Developer portal → Identifiers

3. **App icon**
   - Need one 1024×1024 source image
   - Generate all required Xcode sizes from it (can use `capacitor-assets` or an online generator)
   - Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

4. **Xcode signing**
   - Open `ios/App/App.xcworkspace` in Xcode
   - Select target → Signing & Capabilities → enable Automatic signing
   - Set team to registered Apple Developer account

5. **Build and archive**
   ```bash
   npm run build
   npx cap sync ios
   # Then in Xcode: Product → Archive
   ```

6. **Upload to TestFlight**
   - In Xcode Organizer: Distribute App → App Store Connect → Upload
   - Wait for processing (~10–15 min)

7. **Install on iPhone**
   - Open TestFlight app on iPhone
   - Accept invite → Install

### Splash screen & icons

Capacitor splash screen is already configured (500ms fade, from March 28 commit). Just needs the app icon assets filled in.

### Build scripts (already in package.json)

```bash
npm run ios        # cap sync ios
npm run ios:open   # cap open ios
npm run ios:run    # cap run ios
```

---

## Success Criteria

The beta is ready when:

- [ ] All ~15–20 unit tests pass
- [ ] App builds without errors in Xcode (release configuration)
- [ ] App installs on Juan's iPhone via TestFlight
- [ ] Penny starts as an egg on first launch
- [ ] A debt can be added and persists after app restart
- [ ] A payment reduces the debt balance and awards XP
- [ ] Penny's stage advances when XP threshold is reached
- [ ] App works in both light and dark mode

---

## Out of Scope (This Phase)

- Component/integration tests
- Push notifications
- Android build
- Public App Store release
- Full quality gate (80%+ coverage)
- Backend/sync — app is fully local, no accounts or cloud storage

---

## Next Phase (After Beta)

Once Juan has used the app personally and validated the UX:

1. Full test coverage (stores, components, persistence)
2. Bug fixes from personal use feedback
3. App Store submission (requires privacy policy, screenshots, description)
4. Public release
