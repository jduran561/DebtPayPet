# Feature Sketch: Notification Reminders

This document outlines how to add notification reminders to DebtPayPet. It builds on patterns you already have in the codebase.

---

## What You'll Learn

- Adding new TypeScript types (like you did in `src/types/`)
- Creating a new Zustand store (like `useDebtStore` and `usePetStore`)
- Building a settings component
- Working with dates and time calculations

---

## Step 1: Define the Types

First, we define what a notification preference looks like. This goes in a new file.

**File: `src/types/notifications.ts`**

```typescript
// When should we remind the user?
export type ReminderType =
  | 'due_date'      // X days before a payment is due
  | 'weekly'        // Same day each week
  | 'inactivity'    // Haven't opened app in X days

// A single reminder setting
export interface ReminderSetting {
  id: string
  type: ReminderType
  enabled: boolean

  // Different types need different config:
  daysBefore?: number      // For due_date: remind 3 days before
  dayOfWeek?: number       // For weekly: 0=Sunday, 1=Monday, etc.
  inactiveDays?: number    // For inactivity: after 5 days

  lastTriggered?: Date     // Prevent spam - track when we last reminded
}

// User's notification preferences
export interface NotificationPreferences {
  // Master switch - user can turn all notifications off
  enabled: boolean

  // Individual reminder settings
  reminders: ReminderSetting[]

  // Optional: quiet hours (don't notify during sleep)
  quietHoursStart?: number  // Hour 0-23, e.g., 22 = 10pm
  quietHoursEnd?: number    // Hour 0-23, e.g., 8 = 8am
}
```

**Why this structure?**
- `enabled` as a master switch lets users quickly mute everything
- Each reminder is separate so users can customize (want due dates but not weekly? no problem)
- `lastTriggered` prevents showing the same reminder repeatedly

---

## Step 2: Create the Store

This follows the same pattern as your existing stores.

**File: `src/store/useNotificationStore.ts`**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationPreferences, ReminderSetting } from '../types/notifications'

// Generate unique IDs (simple version)
const generateId = () => Math.random().toString(36).substring(2, 9)

// Default reminders every new user starts with
const DEFAULT_REMINDERS: ReminderSetting[] = [
  {
    id: generateId(),
    type: 'due_date',
    enabled: true,
    daysBefore: 3,  // Remind 3 days before due date
  },
  {
    id: generateId(),
    type: 'weekly',
    enabled: false,  // Off by default, user can enable
    dayOfWeek: 0,    // Sunday
  },
  {
    id: generateId(),
    type: 'inactivity',
    enabled: true,
    inactiveDays: 7,  // Remind if no activity for a week
  },
]

interface NotificationState {
  preferences: NotificationPreferences
  lastAppOpen: Date

  // Actions
  setEnabled: (enabled: boolean) => void
  updateReminder: (id: string, updates: Partial<ReminderSetting>) => void
  toggleReminder: (id: string) => void
  recordAppOpen: () => void

  // Helpers (computed values)
  getActiveReminders: () => ReminderSetting[]
  shouldShowReminder: (type: ReminderType) => boolean
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      preferences: {
        enabled: true,
        reminders: DEFAULT_REMINDERS,
      },
      lastAppOpen: new Date(),

      // Turn all notifications on/off
      setEnabled: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, enabled },
        })),

      // Update a specific reminder's settings
      updateReminder: (id, updates) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            reminders: state.preferences.reminders.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          },
        })),

      // Quick toggle for a reminder
      toggleReminder: (id) => {
        const reminder = get().preferences.reminders.find((r) => r.id === id)
        if (reminder) {
          get().updateReminder(id, { enabled: !reminder.enabled })
        }
      },

      // Call this when app opens (for inactivity tracking)
      recordAppOpen: () => set({ lastAppOpen: new Date() }),

      // Get only enabled reminders
      getActiveReminders: () => {
        const { preferences } = get()
        if (!preferences.enabled) return []
        return preferences.reminders.filter((r) => r.enabled)
      },

      // Check if we should show a specific reminder type
      shouldShowReminder: (type) => {
        const { preferences, lastAppOpen } = get()
        if (!preferences.enabled) return false

        const reminder = preferences.reminders.find(
          (r) => r.type === type && r.enabled
        )
        if (!reminder) return false

        // Don't spam - check if we already reminded recently
        if (reminder.lastTriggered) {
          const hoursSinceLastReminder =
            (Date.now() - reminder.lastTriggered.getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastReminder < 24) return false  // Max once per day
        }

        // Type-specific logic
        if (type === 'inactivity') {
          const daysSinceOpen =
            (Date.now() - lastAppOpen.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceOpen >= (reminder.inactiveDays ?? 7)
        }

        // For other types, return true (caller handles specific logic)
        return true
      },
    }),
    {
      name: 'debtpaypet-notifications',
      // Handle Date serialization (same pattern as your other stores)
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          // Revive Date objects
          if (parsed.state?.lastAppOpen) {
            parsed.state.lastAppOpen = new Date(parsed.state.lastAppOpen)
          }
          parsed.state?.preferences?.reminders?.forEach((r: ReminderSetting) => {
            if (r.lastTriggered) r.lastTriggered = new Date(r.lastTriggered)
          })
          return parsed
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
```

**Key Learning Points:**
- `persist` middleware saves to localStorage automatically
- We handle Date serialization manually (JavaScript gotcha!)
- `get()` lets actions read current state
- `set()` lets actions update state

---

## Step 3: Simple Settings UI

Start with a basic toggle interface. You can make it prettier later.

**File: `src/components/settings/NotificationSettings.tsx`**

```typescript
import { useNotificationStore } from '../../store/useNotificationStore'

export function NotificationSettings() {
  const {
    preferences,
    setEnabled,
    toggleReminder,
    updateReminder
  } = useNotificationStore()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Notification Settings</h2>

      {/* Master toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={preferences.enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5"
        />
        <span>Enable Reminders</span>
      </label>

      {/* Individual reminders */}
      {preferences.enabled && (
        <div className="ml-4 space-y-3">
          {preferences.reminders.map((reminder) => (
            <div key={reminder.id} className="p-3 bg-gray-100 rounded">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={() => toggleReminder(reminder.id)}
                  className="w-4 h-4"
                />
                <span className="font-medium">
                  {reminder.type === 'due_date' && 'Due Date Reminders'}
                  {reminder.type === 'weekly' && 'Weekly Check-in'}
                  {reminder.type === 'inactivity' && 'Inactivity Reminder'}
                </span>
              </label>

              {/* Type-specific settings */}
              {reminder.enabled && reminder.type === 'due_date' && (
                <div className="mt-2 ml-6">
                  <label className="text-sm text-gray-600">
                    Remind me
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={reminder.daysBefore ?? 3}
                      onChange={(e) =>
                        updateReminder(reminder.id, {
                          daysBefore: parseInt(e.target.value)
                        })
                      }
                      className="w-12 mx-1 px-1 border rounded"
                    />
                    days before due date
                  </label>
                </div>
              )}

              {reminder.enabled && reminder.type === 'weekly' && (
                <div className="mt-2 ml-6">
                  <label className="text-sm text-gray-600">
                    Remind me every
                    <select
                      value={reminder.dayOfWeek ?? 0}
                      onChange={(e) =>
                        updateReminder(reminder.id, {
                          dayOfWeek: parseInt(e.target.value),
                        })
                      }
                      className="mx-1 px-1 border rounded"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </label>
                </div>
              )}

              {reminder.enabled && reminder.type === 'inactivity' && (
                <div className="mt-2 ml-6">
                  <label className="text-sm text-gray-600">
                    Remind me after
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={reminder.inactiveDays ?? 7}
                      onChange={(e) =>
                        updateReminder(reminder.id, {
                          inactiveDays: parseInt(e.target.value),
                        })
                      }
                      className="w-12 mx-1 px-1 border rounded"
                    />
                    days of inactivity
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Step 4: Show Reminders in App

Add a simple banner that shows when reminders are triggered.

**In `src/App.tsx`, add:**

```typescript
import { useNotificationStore } from './store/useNotificationStore'
import { useDebtStore } from './store/useDebtStore'
import { useEffect, useState } from 'react'

function ReminderBanner() {
  const [reminder, setReminder] = useState<string | null>(null)
  const { shouldShowReminder, preferences, getActiveReminders } = useNotificationStore()
  const { debts } = useDebtStore()

  useEffect(() => {
    // Check for due date reminders
    if (shouldShowReminder('due_date')) {
      const dueDateReminder = preferences.reminders.find(
        r => r.type === 'due_date' && r.enabled
      )
      const daysBefore = dueDateReminder?.daysBefore ?? 3

      // Find debts due soon
      const today = new Date()
      const upcomingDebts = debts.filter((debt) => {
        if (!debt.dueDay) return false
        const dueDate = new Date(today.getFullYear(), today.getMonth(), debt.dueDay)
        if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilDue <= daysBefore
      })

      if (upcomingDebts.length > 0) {
        setReminder(`${upcomingDebts.length} payment(s) due soon!`)
        return
      }
    }

    // Check for inactivity
    if (shouldShowReminder('inactivity')) {
      setReminder("Welcome back! Time to update your debt progress.")
      return
    }
  }, [])

  if (!reminder) return null

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 p-3 mb-4">
      <div className="flex justify-between items-center">
        <span>{reminder}</span>
        <button
          onClick={() => setReminder(null)}
          className="text-amber-700 hover:text-amber-900"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
```

---

## Testing This Feature

Here's what tests you'd want (building on the test analysis):

```typescript
// useNotificationStore.test.ts
describe('useNotificationStore', () => {
  describe('toggleReminder', () => {
    it('should toggle a reminder on and off')
    it('should not affect other reminders')
  })

  describe('shouldShowReminder', () => {
    it('should return false when master switch is off')
    it('should return false if specific reminder is disabled')
    it('should return false if reminded within 24 hours')
    it('should detect inactivity correctly')
  })

  describe('persistence', () => {
    it('should save preferences to localStorage')
    it('should restore Date objects correctly')
  })
})
```

---

## Next Steps (In Order)

1. **Create the types file** - Start small, just the types
2. **Create the store** - Test it in browser console first
3. **Build the settings UI** - Add a new tab in your app
4. **Add the reminder banner** - Simple in-app notifications
5. **Later: Browser Push Notifications** - More complex, save for later

---

## Questions to Think About

As you build this, consider:

1. What happens if a user has no debts yet? Should they still see notification settings?
2. Should Penny react to reminders? ("Penny misses you!")
3. What's the right default? Too many notifications = annoying, too few = forgettable

These are product decisions - there's no single right answer!
