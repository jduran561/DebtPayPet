# Opening Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an egg-hatching opening animation that plays on first launch, ends with Penny asking to be named, then fades into the main app.

**Architecture:** A new `OpeningAnimation` component manages the full 5-phase animation sequence using local state and timers. `usePetStore` gains a `hasCompletedOnboarding` boolean and `completeOnboarding(name)` action. `App.tsx` renders `OpeningAnimation` fullscreen when `hasCompletedOnboarding` is false, then switches to the normal UI on completion.

**Tech Stack:** React 19, Zustand 5 (persist), CSS keyframe animations, SVG stroke-dashoffset, existing `useConfetti` hook.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/store/usePetStore.ts` | Add `hasCompletedOnboarding` + `completeOnboarding` |
| Create | `src/components/pet/OpeningAnimation.tsx` | Full animation sequence + name input |
| Modify | `src/index.css` | Add keyframes: egg-wobble, crack-draw, hatch-pop, slide-up, app-fade-in |
| Modify | `src/components/index.ts` | Export `OpeningAnimation` |
| Modify | `src/App.tsx` | Conditionally render `OpeningAnimation` |
| Create | `src/store/usePetStore.test.ts` | Tests for `completeOnboarding` action |
| Create | `src/components/pet/OpeningAnimation.test.tsx` | Render + interaction tests |
| Modify | `vite.config.ts` | Add Vitest config |
| Modify | `package.json` | Add test script + dependencies |

---

## Task 1: Set Up Vitest + React Testing Library

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test-setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: packages added to `devDependencies` in `package.json`.

- [ ] **Step 2: Add test config to `vite.config.ts`**

Replace the full file contents with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'state': ['zustand'],
        },
      },
    },
    sourcemap: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
```

- [ ] **Step 3: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add test script to `package.json`**

In the `"scripts"` block, add after the existing scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify setup works**

```bash
npm test
```

Expected: `No test files found` — that's fine, confirms Vitest runs without error.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/test-setup.ts package.json package-lock.json
git commit -m "chore: add vitest and react testing library"
```

---

## Task 2: Add `hasCompletedOnboarding` to Pet Store

**Files:**
- Modify: `src/store/usePetStore.ts`
- Create: `src/store/usePetStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/usePetStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { usePetStore } from './usePetStore';

// Reset store state before each test
beforeEach(() => {
  usePetStore.setState({
    hasCompletedOnboarding: false,
    pet: {
      name: 'Penny',
      stage: 'egg',
      xp: 0,
      totalXpEarned: 0,
      happiness: 50,
      health: 100,
      lastFed: new Date(),
      createdAt: new Date(),
      evolutionHistory: [],
      accessories: [],
      currentAccessory: undefined,
    },
    lastEvolution: null,
  });
});

describe('completeOnboarding', () => {
  it('sets hasCompletedOnboarding to true', () => {
    usePetStore.getState().completeOnboarding('Penny');
    expect(usePetStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('saves the provided name to pet.name', () => {
    usePetStore.getState().completeOnboarding('Sparky');
    expect(usePetStore.getState().pet.name).toBe('Sparky');
  });

  it('falls back to "Penny" if name is empty', () => {
    usePetStore.getState().completeOnboarding('   ');
    expect(usePetStore.getState().pet.name).toBe('Penny');
  });
});

describe('hasCompletedOnboarding initial state', () => {
  it('defaults to false', () => {
    expect(usePetStore.getState().hasCompletedOnboarding).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `completeOnboarding is not a function` (or similar — the action doesn't exist yet).

- [ ] **Step 3: Add `hasCompletedOnboarding` and `completeOnboarding` to the store**

In `src/store/usePetStore.ts`, update the `PetState` interface (add after `clearLastEvolution`):

```ts
hasCompletedOnboarding: boolean;
completeOnboarding: (name: string) => void;
```

In the `create()(persist(...))` body, add the initial value after `lastEvolution: null,`:

```ts
hasCompletedOnboarding: false,
```

Add the action after `clearLastEvolution`:

```ts
completeOnboarding: (name) => {
  set((state) => ({
    hasCompletedOnboarding: true,
    pet: {
      ...state.pet,
      name: name.trim() || 'Penny',
    },
  }));
},
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/store/usePetStore.ts src/store/usePetStore.test.ts
git commit -m "feat: add hasCompletedOnboarding and completeOnboarding to pet store"
```

---

## Task 3: Add Animation Keyframes to CSS

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add keyframes at the bottom of `src/index.css`**

Append to the end of the file:

```css
/* Opening animation keyframes */
@keyframes egg-wobble {
  0%, 100% { transform: rotate(0deg); }
  15%       { transform: rotate(-8deg); }
  30%       { transform: rotate(8deg); }
  45%       { transform: rotate(-6deg); }
  60%       { transform: rotate(6deg); }
  75%       { transform: rotate(-3deg); }
  90%       { transform: rotate(3deg); }
}

@keyframes crack-draw {
  from { stroke-dashoffset: var(--crack-length); }
  to   { stroke-dashoffset: 0; }
}

@keyframes hatch-pop {
  0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
  80%  { transform: scale(0.95) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg);    opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes app-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animate-egg-wobble {
  animation: egg-wobble 0.8s ease-in-out;
}

.animate-hatch-pop {
  animation: hatch-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-app-fade-in {
  animation: app-fade-in 0.5s ease-out forwards;
}
```

- [ ] **Step 2: Verify build still compiles**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add opening animation keyframes to css"
```

---

## Task 4: Build `OpeningAnimation` Component

**Files:**
- Create: `src/components/pet/OpeningAnimation.tsx`
- Create: `src/components/pet/OpeningAnimation.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/pet/OpeningAnimation.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { OpeningAnimation } from './OpeningAnimation';

// Mock useConfetti
vi.mock('../../hooks/useConfetti', () => ({
  useConfetti: () => ({ triggerBig: vi.fn() }),
}));

// Use fake timers so we can control animation phases
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('OpeningAnimation', () => {
  it('renders the egg on mount', () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);
    expect(screen.getByText('🥚')).toBeInTheDocument();
  });

  it('shows the name input after animation completes', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    // Advance through all animation phases (total ~2400ms)
    await act(async () => { vi.advanceTimersByTime(3000); });

    expect(screen.getByPlaceholderText('Penny')).toBeInTheDocument();
    expect(screen.getByText("Let's go! →")).toBeInTheDocument();
  });

  it('calls onComplete with the default name "Penny" when submitted without changes', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    await act(async () => { vi.advanceTimersByTime(3000); });

    fireEvent.click(screen.getByText("Let's go! →"));
    expect(onComplete).toHaveBeenCalledWith('Penny');
  });

  it('calls onComplete with custom name when user types one', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    await act(async () => { vi.advanceTimersByTime(3000); });

    const input = screen.getByPlaceholderText('Penny');
    fireEvent.change(input, { target: { value: 'Sparky' } });
    fireEvent.click(screen.getByText("Let's go! →"));

    expect(onComplete).toHaveBeenCalledWith('Sparky');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — `OpeningAnimation` module not found.

- [ ] **Step 3: Create `src/components/pet/OpeningAnimation.tsx`**

```tsx
/**
 * OpeningAnimation - First-launch egg hatching sequence
 * Phases: appear → wobble → crack → hatch → name
 */

import { useState, useEffect, useRef } from 'react';
import { useConfetti } from '../../hooks/useConfetti';

type Phase = 'appear' | 'wobble' | 'crack' | 'hatch' | 'name';

interface Props {
  onComplete: (name: string) => void;
}

export function OpeningAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('appear');
  const [name, setName] = useState('Penny');
  const { triggerBig } = useConfetti();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // appear → wobble after 400ms
    timers.push(setTimeout(() => setPhase('wobble'), 400));
    // wobble → crack after 400 + 800ms
    timers.push(setTimeout(() => setPhase('crack'), 1200));
    // crack → hatch after 400 + 800 + 600ms
    timers.push(setTimeout(() => {
      setPhase('hatch');
      triggerBig(window.innerWidth / 2, window.innerHeight / 2);
    }, 1800));
    // hatch → name after 400 + 800 + 600 + 600ms
    timers.push(setTimeout(() => setPhase('name'), 2400));

    return () => timers.forEach(clearTimeout);
  }, [triggerBig]);

  // Auto-focus input when name phase begins
  useEffect(() => {
    if (phase === 'name') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(name.trim() || 'Penny');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)' }}
    >
      {/* Egg / Hatchling */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Egg — visible in appear, wobble, crack phases */}
        {(phase === 'appear' || phase === 'wobble' || phase === 'crack') && (
          <div className="relative">
            <span
              className={`text-8xl select-none block ${phase === 'wobble' ? 'animate-egg-wobble' : ''}`}
            >
              🥚
            </span>

            {/* SVG crack overlay — only in crack phase */}
            {phase === 'crack' && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Crack 1 */}
                <path
                  d="M48 10 L44 28 L50 34 L46 52"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                  style={{
                    strokeDasharray: 50,
                    '--crack-length': '50',
                    animation: 'crack-draw 0.4s ease-out 0s forwards',
                  } as React.CSSProperties}
                />
                {/* Crack 2 */}
                <path
                  d="M62 18 L58 30 L64 36"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                  style={{
                    strokeDasharray: 30,
                    '--crack-length': '30',
                    animation: 'crack-draw 0.3s ease-out 0.1s forwards',
                  } as React.CSSProperties}
                />
                {/* Crack 3 */}
                <path
                  d="M34 24 L38 38"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                  style={{
                    strokeDasharray: 20,
                    '--crack-length': '20',
                    animation: 'crack-draw 0.25s ease-out 0.2s forwards',
                  } as React.CSSProperties}
                />
              </svg>
            )}
          </div>
        )}

        {/* Hatchling — visible in hatch + name phases */}
        {(phase === 'hatch' || phase === 'name') && (
          <span className={`text-8xl select-none block ${phase === 'hatch' ? 'animate-hatch-pop' : ''}`}>
            🐣
          </span>
        )}
      </div>

      {/* Name card — slides up in name phase */}
      {phase === 'name' && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up mt-8 w-72 bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4"
        >
          <p className="text-white/70 text-sm text-center">What will you name me?</p>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Penny"
            maxLength={20}
            className="w-full bg-white/20 text-white placeholder-white/40 rounded-lg px-4 py-2 text-center text-lg font-medium outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="w-full bg-white text-indigo-700 font-bold rounded-full py-3 text-base hover:bg-white/90 active:scale-95 transition-all"
          >
            Let&apos;s go! →
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests in `OpeningAnimation.test.tsx` and `usePetStore.test.ts` pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/pet/OpeningAnimation.tsx src/components/pet/OpeningAnimation.test.tsx
git commit -m "feat: add OpeningAnimation component"
```

---

## Task 5: Export Component and Wire into App

**Files:**
- Modify: `src/components/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add export to `src/components/index.ts`**

After the `export { PennySays }` line, add:

```ts
export { OpeningAnimation } from './pet/OpeningAnimation';
```

- [ ] **Step 2: Update `src/App.tsx` to use the animation**

At the top of `App.tsx`, add `OpeningAnimation` to the imports from `'./components'`:

```ts
import {
  PetDisplay,
  DebtSummaryCard,
  DebtList,
  AddDebtForm,
  StrategySelector,
  PayoffCalculator,
  NotificationSettings,
  ReminderBanner,
  ThemeToggle,
  AchievementsPanel,
  AchievementToast,
  EvolutionCelebration,
  PennySays,
  OpeningAnimation,
} from './components';
```

Add `completeOnboarding` and `hasCompletedOnboarding` to the store destructure. Find this line:

```ts
const { pet } = usePetStore();
```

Replace with:

```ts
const { pet, hasCompletedOnboarding, completeOnboarding } = usePetStore();
```

Add a `fadingIn` state for the app-reveal transition after the opening line of `function App()`:

```ts
const [fadingIn, setFadingIn] = useState(false);
```

Add the `handleOnboardingComplete` handler, just before the `tabs` array:

```ts
const handleOnboardingComplete = (name: string) => {
  completeOnboarding(name);
  setFadingIn(true);
};
```

Finally, wrap the entire returned JSX in a conditional. Replace the outer `<div className="min-h-screen ...">` opening (the very first line of the return statement) so the full return looks like:

```tsx
if (!hasCompletedOnboarding) {
  return <OpeningAnimation onComplete={handleOnboardingComplete} />;
}

return (
  <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-slate-900 ${fadingIn ? 'animate-app-fade-in' : ''}`}>
    {/* ... rest of existing JSX unchanged ... */}
  </div>
);
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/index.ts src/App.tsx
git commit -m "feat: wire opening animation into app on first launch"
```

---

## Task 6: Manual QA

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Clear localStorage to simulate first launch**

In the browser devtools console:

```js
localStorage.removeItem('debtpet-pet');
location.reload();
```

Expected sequence:
1. Purple screen with 🥚 fades in
2. Egg wobbles
3. Crack lines appear on egg
4. 🐣 pops out with confetti
5. Name card slides up with "What will you name me?" and a "Penny" input
6. Type a name (or keep default), click "Let's go! →"
7. App fades in to the dashboard

- [ ] **Step 3: Verify it doesn't replay on reload**

Reload the page without clearing localStorage. Expected: app opens directly to dashboard, no animation.

- [ ] **Step 4: Verify name is saved**

After completing onboarding, check the PetDisplay on the dashboard — pet name should match what was entered.

- [ ] **Step 5: Sync to iOS and test on device/simulator**

```bash
npm run ios:sync
```

Then hit play in Xcode. Verify the animation runs smoothly on the iOS simulator.

- [ ] **Step 6: Final commit if any tweaks were made**

```bash
git add -p
git commit -m "fix: opening animation QA tweaks"
```
