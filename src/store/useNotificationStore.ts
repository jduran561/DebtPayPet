/**
 * Notification Store - Zustand slice for reminder preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationPreferences, ReminderSetting, ReminderType } from '../types/notifications';

// Generate unique IDs
const generateId = () => crypto.randomUUID();

// Default reminders every new user starts with
const createDefaultReminders = (): ReminderSetting[] => [
  {
    id: generateId(),
    type: 'due_date',
    enabled: true,
    daysBefore: 3, // Remind 3 days before due date
  },
  {
    id: generateId(),
    type: 'weekly',
    enabled: false, // Off by default, user can enable
    dayOfWeek: 0, // Sunday
  },
  {
    id: generateId(),
    type: 'inactivity',
    enabled: true,
    inactiveDays: 7, // Remind if no activity for a week
  },
];

interface NotificationState {
  preferences: NotificationPreferences;
  lastAppOpen: Date;
  dismissedReminders: string[]; // Track dismissed reminder types for this session

  // Actions
  setEnabled: (enabled: boolean) => void;
  updateReminder: (id: string, updates: Partial<ReminderSetting>) => void;
  toggleReminder: (id: string) => void;
  recordAppOpen: () => void;
  dismissReminder: (type: ReminderType) => void;
  clearDismissed: () => void;
  markReminderTriggered: (type: ReminderType) => void;

  // Helpers (computed values)
  getActiveReminders: () => ReminderSetting[];
  getReminderByType: (type: ReminderType) => ReminderSetting | undefined;
  shouldShowReminder: (type: ReminderType) => boolean;
  isDismissed: (type: ReminderType) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      preferences: {
        enabled: true,
        reminders: createDefaultReminders(),
      },
      lastAppOpen: new Date(),
      dismissedReminders: [],

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
        const reminder = get().preferences.reminders.find((r) => r.id === id);
        if (reminder) {
          get().updateReminder(id, { enabled: !reminder.enabled });
        }
      },

      // Call this when app opens (for inactivity tracking)
      recordAppOpen: () => set({ lastAppOpen: new Date(), dismissedReminders: [] }),

      // Dismiss a reminder for this session
      dismissReminder: (type) =>
        set((state) => ({
          dismissedReminders: [...state.dismissedReminders, type],
        })),

      // Clear dismissed (called on new session)
      clearDismissed: () => set({ dismissedReminders: [] }),

      // Mark when a reminder was shown (to prevent spam)
      markReminderTriggered: (type) => {
        const reminder = get().preferences.reminders.find(
          (r) => r.type === type && r.enabled
        );
        if (reminder) {
          get().updateReminder(reminder.id, { lastTriggered: new Date() });
        }
      },

      // Get only enabled reminders
      getActiveReminders: () => {
        const { preferences } = get();
        if (!preferences.enabled) return [];
        return preferences.reminders.filter((r) => r.enabled);
      },

      // Get reminder by type
      getReminderByType: (type) => {
        return get().preferences.reminders.find((r) => r.type === type);
      },

      // Check if a reminder type was dismissed this session
      isDismissed: (type) => {
        return get().dismissedReminders.includes(type);
      },

      // Check if we should show a specific reminder type
      shouldShowReminder: (type) => {
        const { preferences, lastAppOpen, dismissedReminders } = get();

        // Master switch off
        if (!preferences.enabled) return false;

        // Already dismissed this session
        if (dismissedReminders.includes(type)) return false;

        const reminder = preferences.reminders.find(
          (r) => r.type === type && r.enabled
        );
        if (!reminder) return false;

        // Don't spam - check if we already reminded in last 24 hours
        if (reminder.lastTriggered) {
          const hoursSinceLastReminder =
            (Date.now() - reminder.lastTriggered.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastReminder < 24) return false;
        }

        // Type-specific logic
        if (type === 'inactivity') {
          const daysSinceOpen =
            (Date.now() - lastAppOpen.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceOpen >= (reminder.inactiveDays ?? 7);
        }

        if (type === 'weekly') {
          const today = new Date().getDay();
          return today === (reminder.dayOfWeek ?? 0);
        }

        // For due_date, return true - caller will check actual debts
        return true;
      },
    }),
    {
      name: 'debtpet-notifications',
      // Handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Revive Date objects
          if (parsed.state) {
            if (parsed.state.lastAppOpen) {
              parsed.state.lastAppOpen = new Date(parsed.state.lastAppOpen);
            }
            parsed.state.preferences?.reminders?.forEach((r: ReminderSetting) => {
              if (r.lastTriggered) r.lastTriggered = new Date(r.lastTriggered);
            });
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      // Don't persist dismissedReminders (session-only)
      partialize: (state) =>
        ({
          preferences: state.preferences,
          lastAppOpen: state.lastAppOpen,
        }) as NotificationState,
    }
  )
);
