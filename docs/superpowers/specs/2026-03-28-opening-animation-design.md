# Opening Animation — Design Spec

**Date:** 2026-03-28
**Status:** Approved

## Overview

An egg-hatching opening animation that plays on first launch only. After Penny hatches, the user is prompted to name their pet before the main app loads. Creates an emotional connection with the pet from the very first interaction.

## Animation Sequence

5 steps, ~2.4 seconds total:

| Step | Description | Duration |
|------|-------------|----------|
| 1 | Full-screen purple background, 🥚 fades in centered | ~0.4s |
| 2 | Egg wobbles — CSS shake (left/right) | ~0.8s |
| 3 | SVG crack lines draw in via `stroke-dashoffset` (2–3 cracks) | ~0.6s |
| 4 | Egg hides, 🐣 scales up (0 → 1.2 → 1), confetti fires | ~0.6s |
| 5 | Name card slides up from bottom | instant after step 4 |

**Name card content:**
- Label: "What will you name me?"
- Text input pre-filled with "Penny"
- "Let's go! →" confirm button
- On confirm: name saved, app fades in

## Components

### `OpeningAnimation` (`src/components/pet/OpeningAnimation.tsx`)

New component responsible for the full animation sequence and name input. Self-contained — manages its own animation state via `useState` and `useEffect` timers.

Props:
- `onComplete(name: string): void` — called when user confirms the name

Internal state:
- `phase: 'appear' | 'wobble' | 'crack' | 'hatch' | 'name'`
- `name: string` — controlled input value

Uses the existing `useConfetti` hook (`triggerSmall`) for the burst in step 4.

### `App.tsx` changes

On mount, reads `hasCompletedOnboarding` from `usePetStore`. If `false`, renders `<OpeningAnimation>` fullscreen instead of the main UI. On `onComplete`, the app fades in normally.

## Store Changes

`usePetStore` gets one new field:

```ts
hasCompletedOnboarding: boolean  // default: false
```

And one new action:

```ts
completeOnboarding(name: string): void
// Sets hasCompletedOnboarding = true, updates pet.name
```

The existing `pet.name` field (default `"Penny"`) is already in the store — no schema changes needed beyond the new boolean flag.

## Animation Implementation

- **Egg wobble:** CSS keyframe `@keyframes egg-wobble` — rotate ±8deg, 3 cycles
- **SVG cracks:** 2–3 `<path>` elements with `stroke-dasharray` equal to path length, animated from `stroke-dashoffset: length` → `0`
- **Hatch burst:** CSS `@keyframes hatch-pop` — `scale(0) → scale(1.2) → scale(1)`
- **Name card:** `translateY(40px) opacity(0)` → `translateY(0) opacity(1)` via CSS transition

No new dependencies required.

## First-Launch Detection

`hasCompletedOnboarding` persists in Zustand store (already uses `localStorage` via `persist` middleware). On every app open, `App.tsx` checks this flag synchronously before rendering.

## Out of Scope

- Replay button / re-watching the animation
- Skipping the animation on subsequent launches (handled automatically by the flag)
- Custom animation for returning users
