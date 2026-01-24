/**
 * Notification Types - Types for the reminder notification system
 */

// When should we remind the user?
export type ReminderType =
  | 'due_date'      // X days before a payment is due
  | 'weekly'        // Same day each week
  | 'inactivity';   // Haven't opened app in X days

// A single reminder setting
export interface ReminderSetting {
  id: string;
  type: ReminderType;
  enabled: boolean;

  // Different types need different config:
  daysBefore?: number;      // For due_date: remind 3 days before
  dayOfWeek?: number;       // For weekly: 0=Sunday, 1=Monday, etc.
  inactiveDays?: number;    // For inactivity: after 5 days

  lastTriggered?: Date;     // Prevent spam - track when we last reminded
}

// User's notification preferences
export interface NotificationPreferences {
  // Master switch - user can turn all notifications off
  enabled: boolean;

  // Individual reminder settings
  reminders: ReminderSetting[];

  // Optional: quiet hours (don't notify during sleep)
  quietHoursStart?: number;  // Hour 0-23, e.g., 22 = 10pm
  quietHoursEnd?: number;    // Hour 0-23, e.g., 8 = 8am
}

// Labels for display
export const REMINDER_LABELS: Record<ReminderType, { title: string; description: string }> = {
  due_date: {
    title: 'Due Date Reminders',
    description: 'Get reminded before payments are due',
  },
  weekly: {
    title: 'Weekly Check-in',
    description: 'Regular reminder to update your progress',
  },
  inactivity: {
    title: 'Inactivity Reminder',
    description: "Penny misses you when you're away!",
  },
};

// Day of week labels
export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
