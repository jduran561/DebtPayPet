/**
 * ReminderBanner - Shows contextual reminder notifications
 */

import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useDebtStore } from '../../store/useDebtStore';
import type { ReminderType } from '../../types/notifications';

interface ReminderMessage {
  type: ReminderType;
  message: string;
  emoji: string;
}

export function ReminderBanner() {
  const [reminder, setReminder] = useState<ReminderMessage | null>(null);
  const {
    shouldShowReminder,
    getReminderByType,
    dismissReminder,
    markReminderTriggered,
    recordAppOpen,
  } = useNotificationStore();
  const { debts } = useDebtStore();

  useEffect(() => {
    // Record that the app was opened
    recordAppOpen();

    // Check for due date reminders first (highest priority)
    if (shouldShowReminder('due_date')) {
      const dueDateReminder = getReminderByType('due_date');
      const daysBefore = dueDateReminder?.daysBefore ?? 3;

      // Find debts due soon
      const today = new Date();
      const upcomingDebts = debts.filter((debt) => {
        if (!debt.dueDay || debt.currentBalance <= 0) return false;

        // Calculate next due date
        const dueDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          debt.dueDay
        );
        // If due date has passed this month, check next month
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilDue <= daysBefore && daysUntilDue >= 0;
      });

      if (upcomingDebts.length > 0) {
        const debtNames = upcomingDebts
          .slice(0, 2)
          .map((d) => d.nickname || d.name)
          .join(', ');
        const moreCount = upcomingDebts.length - 2;

        setReminder({
          type: 'due_date',
          message:
            upcomingDebts.length === 1
              ? `${debtNames} payment is due soon!`
              : moreCount > 0
                ? `${debtNames} and ${moreCount} more due soon!`
                : `${debtNames} payments are due soon!`,
          emoji: '📅',
        });
        markReminderTriggered('due_date');
        return;
      }
    }

    // Check for weekly check-in
    if (shouldShowReminder('weekly')) {
      setReminder({
        type: 'weekly',
        message: "It's your weekly check-in day! Update your debt progress.",
        emoji: '🔄',
      });
      markReminderTriggered('weekly');
      return;
    }

    // Check for inactivity (lowest priority)
    if (shouldShowReminder('inactivity')) {
      setReminder({
        type: 'inactivity',
        message: 'Penny missed you! Time to check on your debt progress.',
        emoji: '🐉',
      });
      markReminderTriggered('inactivity');
      return;
    }
  }, []);

  const handleDismiss = () => {
    if (reminder) {
      dismissReminder(reminder.type);
    }
    setReminder(null);
  };

  if (!reminder) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{reminder.emoji}</span>
          <div>
            <p className="font-medium text-amber-800">{reminder.message}</p>
            <p className="text-sm text-amber-600 mt-1">
              {reminder.type === 'due_date' &&
                'Make a payment to keep Penny happy!'}
              {reminder.type === 'weekly' &&
                'Regular updates help you stay on track.'}
              {reminder.type === 'inactivity' &&
                "Let's crush some debt together!"}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400 hover:text-amber-600 transition-colors p-1"
          aria-label="Dismiss reminder"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
