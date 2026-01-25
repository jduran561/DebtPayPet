/**
 * AddDebtForm - Form for adding a new debt
 */

import { useState } from 'react';
import { useDebtStore } from '../../store';
import { usePetStore } from '../../store';
import type { DebtCategory } from '../../types/debt';
import { XP_REWARDS } from '../../types/pet';
import { useAchievementChecker } from '../../hooks/useAchievementChecker';

interface AddDebtFormProps {
  onClose: () => void;
  isFirstDebt?: boolean;
}

const categories: { value: DebtCategory; label: string; emoji: string }[] = [
  { value: 'credit_card', label: 'Credit Card', emoji: '💳' },
  { value: 'student_loan', label: 'Student Loan', emoji: '🎓' },
  { value: 'auto_loan', label: 'Auto Loan', emoji: '🚗' },
  { value: 'personal_loan', label: 'Personal Loan', emoji: '💰' },
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'mortgage', label: 'Mortgage', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

export function AddDebtForm({ onClose, isFirstDebt = false }: AddDebtFormProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState<DebtCategory>('credit_card');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addDebt, debts } = useDebtStore();
  const { addXp } = usePetStore();
  const { onDebtAdded } = useAchievementChecker();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Debt name is required';
    }

    // Validate balance
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum <= 0) {
      newErrors.balance = 'Balance must be greater than $0';
    } else if (balanceNum > 10000000) {
      newErrors.balance = 'Balance seems too high. Please verify.';
    }

    // Validate interest rate
    const interestNum = parseFloat(interestRate);
    if (isNaN(interestNum) || interestNum < 0) {
      newErrors.interestRate = 'Interest rate must be 0% or higher';
    } else if (interestNum > 100) {
      newErrors.interestRate = 'Interest rate cannot exceed 100%';
    }

    // Validate minimum payment
    const minPaymentNum = parseFloat(minimumPayment);
    if (isNaN(minPaymentNum) || minPaymentNum < 0) {
      newErrors.minimumPayment = 'Minimum payment must be $0 or higher';
    } else if (minPaymentNum > balanceNum) {
      newErrors.minimumPayment = 'Minimum payment cannot exceed balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const balanceNum = parseFloat(balance);
    const interestNum = parseFloat(interestRate);
    const minPaymentNum = parseFloat(minimumPayment);
    const dueDayNum = parseInt(dueDay);

    addDebt({
      name,
      nickname: nickname || undefined,
      originalBalance: balanceNum,
      currentBalance: balanceNum,
      interestRate: interestNum,
      minimumPayment: minPaymentNum,
      dueDay: dueDayNum,
      category,
      notes: notes || undefined,
    });

    // Award XP for adding first debt
    if (debts.length === 0) {
      addXp(XP_REWARDS.FIRST_DEBT_ADDED, 'Added first debt - journey begins!');
    }

    // Trigger achievement check
    onDebtAdded();

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {isFirstDebt ? 'Add Your First Debt' : 'Add New Debt'}
        </h3>
        {isFirstDebt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Start your debt-free journey! Adding your first debt earns you {XP_REWARDS.FIRST_DEBT_ADDED} XP.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Debt Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Debt Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
              }`}
              placeholder="e.g., Chase Sapphire Preferred"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nickname (optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100"
              placeholder="e.g., The Beast, Vacation Hangover"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">A fun name to motivate you</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-2 rounded-lg text-center transition-colors ${
                    category === cat.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
                  }`}
                >
                  <span className="text-lg block">{cat.emoji}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balance and Interest Rate - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Balance *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                    if (errors.balance) setErrors((prev) => ({ ...prev, balance: '' }));
                  }}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                    errors.balance ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.balance && (
                <p className="text-xs text-red-500 mt-1">{errors.balance}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interest Rate *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={interestRate}
                  onChange={(e) => {
                    setInterestRate(e.target.value);
                    if (errors.interestRate) setErrors((prev) => ({ ...prev, interestRate: '' }));
                  }}
                  className={`w-full pr-8 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                    errors.interestRate ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
                  }`}
                  placeholder="18.99"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
              </div>
              {errors.interestRate && (
                <p className="text-xs text-red-500 mt-1">{errors.interestRate}</p>
              )}
            </div>
          </div>

          {/* Minimum Payment and Due Day - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Payment *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumPayment}
                  onChange={(e) => {
                    setMinimumPayment(e.target.value);
                    if (errors.minimumPayment) setErrors((prev) => ({ ...prev, minimumPayment: '' }));
                  }}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                    errors.minimumPayment ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.minimumPayment && (
                <p className="text-xs text-red-500 mt-1">{errors.minimumPayment}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Day of Month
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 resize-none"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
            >
              Add Debt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
