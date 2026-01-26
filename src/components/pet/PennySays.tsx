/**
 * PennySays - Rotating encouraging quotes from Penny based on context
 */

import { useMemo } from 'react';
import { usePetStore } from '../../store';
import { useDebtStore } from '../../store';

const STREAK_QUOTES = (n: number) => [
  `You're on fire! ${n} days in a row! 🔥`,
  `Consistency is key. ${n} days strong!`,
  `Penny loves your dedication! ${n} day streak!`,
];

const DEBT_FREE_QUOTES = [
  "You're debt-free! Penny is so proud! 🎉",
  'No debts? You\'re a legend! ✨',
  'Debt-free and thriving. Penny couldn\'t be happier!',
];

const SUPPORTIVE_QUOTES = [
  'Every payment counts. You\'ve got this!',
  'Penny believes in you. One step at a time.',
  'Progress, not perfection. Keep going!',
];

const HAPPY_QUOTES = [
  'Look at you go! Penny is thriving!',
  'You and Penny make a great team!',
  'Amazing progress! 🐉',
];

const DEFAULT_QUOTES = [
  'Make a payment to help Penny grow!',
  'Small steps lead to big progress.',
  'Your future self will thank you.',
  'Penny is rooting for you!',
  'Every payment is a step toward freedom.',
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

export function PennySays() {
  const { getMood } = usePetStore();
  const { debts, getTotalDebt, getPaymentStreak } = useDebtStore();
  const mood = getMood();
  const streak = getPaymentStreak();
  const totalDebt = getTotalDebt();
  const debtFree = debts.length === 0 || totalDebt === 0;

  const quote = useMemo(() => {
    const seed = Math.random();
    if (streak >= 3) return pick(STREAK_QUOTES(streak), seed);
    if (debtFree) return pick(DEBT_FREE_QUOTES, seed);
    if (mood.mood === 'sad' || mood.mood === 'worried') return pick(SUPPORTIVE_QUOTES, seed);
    if (mood.mood === 'ecstatic' || mood.mood === 'happy') return pick(HAPPY_QUOTES, seed);
    return pick(DEFAULT_QUOTES, seed);
  }, [mood.mood, streak, totalDebt, debts.length]);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 dark:from-brand-primary/20 dark:to-brand-secondary/20 border border-brand-primary/20 dark:border-brand-primary/30">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Penny says</p>
      <p className="text-gray-800 dark:text-gray-100 font-medium">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}
