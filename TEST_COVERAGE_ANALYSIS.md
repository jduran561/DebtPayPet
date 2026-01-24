# Test Coverage Analysis: DebtPayPet

## Executive Summary

**Current Test Coverage: 0%**

The DebtPayPet application currently has **no test infrastructure** - no test files, no test configuration, and no testing dependencies. This analysis identifies critical areas requiring test coverage, prioritized by risk and business impact.

---

## Current State

### What Exists
- 5 React components (PetDisplay, DebtList, AddDebtForm, DebtSummaryCard, StrategySelector)
- 2 Zustand stores (useDebtStore, usePetStore) with complex business logic
- TypeScript type definitions with constants (EVOLUTION_THRESHOLDS, XP_REWARDS)
- localStorage persistence with custom Date serialization

### What's Missing
- No test framework configured (Vitest recommended for Vite projects)
- No test files (`*.test.ts`, `*.spec.ts`)
- No testing utilities (@testing-library/react)
- No mock setup for localStorage or Date

---

## Priority 1: Critical Business Logic (Highest Risk)

### 1.1 Debt Store (`useDebtStore.ts`)

| Function | Risk Level | Why It Needs Tests |
|----------|------------|-------------------|
| `addPayment()` | **CRITICAL** | Updates debt balance - financial accuracy is paramount |
| `getSortedDebts()` | **HIGH** | Determines payoff priority - wrong sorting means wrong financial advice |
| `getTotalDebt()` | **HIGH** | Dashboard accuracy - users make decisions based on this |
| `deleteDebt()` | **MEDIUM** | Cascade deletes payments - data integrity |

**Recommended Tests:**
```typescript
// useDebtStore.test.ts
describe('useDebtStore', () => {
  describe('addPayment', () => {
    it('should reduce debt balance by payment amount')
    it('should not allow balance to go below zero')
    it('should track payment in payments array')
    it('should handle partial payments correctly')
  })

  describe('getSortedDebts', () => {
    it('should sort by highest interest first (avalanche)')
    it('should sort by lowest balance first (snowball)')
    it('should exclude paused debts')
    it('should exclude fully paid debts')
  })

  describe('getTotalDebt', () => {
    it('should sum all current balances')
    it('should return 0 when no debts exist')
  })
})
```

### 1.2 Pet Store (`usePetStore.ts`)

| Function | Risk Level | Why It Needs Tests |
|----------|------------|-------------------|
| `checkEvolution()` | **CRITICAL** | Core gamification mechanic - wrong thresholds break user motivation |
| `addXp()` | **HIGH** | XP accumulation drives the entire reward system |
| `getMood()` | **MEDIUM** | User feedback mechanism - affects UX |
| `getProgressToNextStage()` | **MEDIUM** | Progress calculation - percentage math can have edge cases |

**Recommended Tests:**
```typescript
// usePetStore.test.ts
describe('usePetStore', () => {
  describe('checkEvolution', () => {
    it('should evolve from egg to hatchling at 100 XP')
    it('should evolve from hatchling to juvenile at 500 XP')
    it('should evolve through multiple stages if XP exceeds thresholds')
    it('should not evolve past legendary')
    it('should record evolution in evolutionHistory')
    it('should increase happiness on evolution')
  })

  describe('addXp', () => {
    it('should increase both xp and totalXpEarned')
    it('should trigger evolution check after adding XP')
  })

  describe('getMood', () => {
    it('should return ecstatic when wellbeing >= 90')
    it('should return worried when wellbeing < 50 or inactive > 7 days')
    it('should handle edge cases at threshold boundaries')
  })

  describe('getProgressToNextStage', () => {
    it('should return 0% at stage start')
    it('should return 100% when at max stage')
    it('should calculate correct percentage mid-stage')
  })
})
```

---

## Priority 2: Data Persistence & Serialization (Medium-High Risk)

### 2.1 localStorage Serialization

Both stores have custom serialization for Date objects. This is a common source of bugs.

| Area | Risk | Potential Bug |
|------|------|---------------|
| Date revival on load | **HIGH** | Dates could be strings instead of Date objects |
| Empty state handling | **MEDIUM** | null/undefined checks in deserialization |
| Migration scenarios | **LOW** | Future schema changes need handling |

**Recommended Tests:**
```typescript
// persistence.test.ts
describe('localStorage persistence', () => {
  describe('debt store', () => {
    it('should serialize and deserialize Date objects correctly')
    it('should handle missing localStorage gracefully')
    it('should handle corrupted JSON data')
  })

  describe('pet store', () => {
    it('should revive lastFed as Date object')
    it('should revive createdAt as Date object')
    it('should revive evolutionHistory dates')
  })
})
```

---

## Priority 3: Component Integration Tests (Medium Risk)

### 3.1 DebtList Component

This is the most complex component with payment modal and state interactions.

**Recommended Tests:**
```typescript
// DebtList.test.tsx
describe('DebtList', () => {
  it('should render list of active debts')
  it('should sort debts according to selected strategy')
  it('should open payment modal when Make Payment clicked')
  it('should submit payment and update debt balance')
  it('should award XP after successful payment')
  it('should show paid-off debts in collapsed section')
  it('should confirm before deleting a debt')
})
```

### 3.2 AddDebtForm Component

**Recommended Tests:**
```typescript
// AddDebtForm.test.tsx
describe('AddDebtForm', () => {
  it('should validate required fields')
  it('should not allow negative values for balance/interest')
  it('should restrict dueDay to 1-31')
  it('should award XP for first debt added')
  it('should close modal after successful submission')
})
```

### 3.3 StrategySelector Component

**Recommended Tests:**
```typescript
// StrategySelector.test.tsx
describe('StrategySelector', () => {
  it('should display current strategy as selected')
  it('should switch strategy when clicking different option')
  it('should award XP on first strategy selection')
})
```

---

## Priority 4: Edge Cases & Boundary Conditions (Proactive)

### 4.1 Financial Edge Cases

```typescript
describe('Financial Edge Cases', () => {
  it('should handle $0 debts')
  it('should handle 0% interest rate')
  it('should handle payments larger than remaining balance')
  it('should handle very large debt amounts (overflow protection)')
  it('should handle many debts (performance)')
})
```

### 4.2 Pet System Edge Cases

```typescript
describe('Pet Edge Cases', () => {
  it('should clamp happiness to 0-100 range')
  it('should clamp health to 0-100 range')
  it('should handle empty pet name (default to Penny)')
  it('should handle rapid XP additions')
})
```

---

## Recommended Test Infrastructure Setup

### 1. Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. Configure Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
```

### 3. Add Test Setup (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as unknown as Storage

// Reset stores between tests
beforeEach(() => {
  localStorage.clear()
})
```

### 4. Add Test Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Highest Impact)
1. Set up Vitest and testing infrastructure
2. Write unit tests for `useDebtStore` (all actions and computed helpers)
3. Write unit tests for `usePetStore` (evolution logic, XP system)

### Phase 2: Persistence & Integration
4. Test localStorage serialization/deserialization
5. Write component tests for `DebtList` with payment flow
6. Write component tests for `AddDebtForm` with validation

### Phase 3: Complete Coverage
7. Test remaining components (PetDisplay, DebtSummaryCard, StrategySelector)
8. Add edge case tests
9. Set up CI pipeline with coverage requirements

---

## Coverage Goals

| Metric | Target | Rationale |
|--------|--------|-----------|
| Statement Coverage | 80%+ | Industry standard for critical applications |
| Branch Coverage | 75%+ | Ensure conditional logic is tested |
| Store Functions | 100% | Business logic must be fully tested |
| Component Render | 90%+ | All user-facing code should be verified |

---

## Summary

The DebtPayPet application handles **financial data** and **gamification mechanics** - both require high confidence in correctness. The complete absence of tests is a significant risk.

**Top 3 Testing Priorities:**
1. **Payment processing** in `useDebtStore.addPayment()` - financial accuracy
2. **Evolution logic** in `usePetStore.checkEvolution()` - core gamification
3. **Debt sorting** in `useDebtStore.getSortedDebts()` - determines user's payoff strategy

Implementing the recommended test suite would transform this from a zero-coverage project to a maintainable, production-ready application.
