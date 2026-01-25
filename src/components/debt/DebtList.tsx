/**
 * DebtList - Shows all debts with ability to make payments
 */

import { useState } from 'react';
import { useDebtStore } from '../../store';
import { usePetStore } from '../../store';
import type { Debt, PaymentType, DebtCategory } from '../../types/debt';
import { XP_REWARDS } from '../../types/pet';
import { useAchievementChecker } from '../../hooks/useAchievementChecker';
import { useConfetti } from '../../hooks/useConfetti';

interface PaymentModalProps {
  debt: Debt;
  onClose: () => void;
}

function PaymentModal({ debt, onClose }: PaymentModalProps) {
  const [amount, setAmount] = useState(debt.minimumPayment.toString());
  const [paymentType, setPaymentType] = useState<PaymentType>('minimum');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const { addPayment, debts } = useDebtStore();
  const { addXp, recordFeeding } = usePetStore();
  const { onPaymentMade, checkDebtMilestones } = useAchievementChecker();
  const { triggerBig, triggerMassive } = useConfetti();

  const validatePayment = (): boolean => {
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Payment amount must be greater than $0');
      return false;
    }

    if (paymentAmount > debt.currentBalance) {
      setError(`Payment cannot exceed current balance ($${debt.currentBalance.toFixed(2)})`);
      return false;
    }

    if (paymentAmount > 1000000) {
      setError('Payment amount seems too high. Please verify.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    const paymentAmount = parseFloat(amount);
    const newBalance = Math.max(0, debt.currentBalance - paymentAmount);
    const isDebtPaidOff = newBalance === 0;

    // Add the payment
    addPayment({
      debtId: debt.id,
      amount: paymentAmount,
      date: new Date(),
      type: paymentType,
      notes: notes || undefined,
    });

    // Award XP based on payment type
    let xpAmount: number = XP_REWARDS.MINIMUM_PAYMENT;
    if (paymentType === 'extra') {
      xpAmount = XP_REWARDS.EXTRA_PAYMENT;
    } else if (paymentType === 'lump_sum') {
      xpAmount = XP_REWARDS.LUMP_SUM_PAYMENT;
    }

    addXp(xpAmount, `${paymentType} payment on ${debt.name}`);
    recordFeeding();

    // Track payment for achievements
    onPaymentMade();

    // Check if this payment paid off the debt
    if (isDebtPaidOff) {
      // Check if ALL debts are now paid off
      const otherDebts = debts.filter(d => d.id !== debt.id);
      const allDebtsPaidOff = otherDebts.every(d => d.currentBalance === 0);

      if (allDebtsPaidOff && debts.length > 0) {
        // All debts paid off - massive celebration!
        triggerMassive();
      } else {
        // Just this debt paid off - big celebration
        triggerBig();
      }

      // Re-check debt milestones
      setTimeout(checkDebtMilestones, 100);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Make Payment on {debt.nickname || debt.name}
        </h3>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-surface-elevated rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-2xl font-bold text-debt-danger">
            ${debt.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                  error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
                }`}
                placeholder="0.00"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'minimum', label: 'Minimum', xp: XP_REWARDS.MINIMUM_PAYMENT },
                { value: 'extra', label: 'Extra', xp: XP_REWARDS.EXTRA_PAYMENT },
                { value: 'lump_sum', label: 'Lump Sum', xp: XP_REWARDS.LUMP_SUM_PAYMENT },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentType(option.value as PaymentType)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    paymentType === option.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
                  }`}
                >
                  {option.label}
                  <span className="block text-xs opacity-75">+{option.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100"
              placeholder="Any notes about this payment..."
            />
          </div>

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
              className="flex-1 py-2 px-4 bg-debt-good text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  personal_loan: 'Personal Loan',
  medical: 'Medical',
  mortgage: 'Mortgage',
  other: 'Other',
};

const categories: { value: DebtCategory; label: string; emoji: string }[] = [
  { value: 'credit_card', label: 'Credit Card', emoji: '💳' },
  { value: 'student_loan', label: 'Student Loan', emoji: '🎓' },
  { value: 'auto_loan', label: 'Auto Loan', emoji: '🚗' },
  { value: 'personal_loan', label: 'Personal Loan', emoji: '💰' },
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'mortgage', label: 'Mortgage', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

interface EditDebtModalProps {
  debt: Debt;
  onClose: () => void;
}

interface PaymentHistoryModalProps {
  debt: Debt;
  onClose: () => void;
}

function PaymentHistoryModal({ debt, onClose }: PaymentHistoryModalProps) {
  const { getPaymentsByDebtId } = useDebtStore();
  const payments = getPaymentsByDebtId(debt.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentTypeLabel = (type: PaymentType) => {
    switch (type) {
      case 'minimum':
        return { label: 'Minimum', color: 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300' };
      case 'extra':
        return { label: 'Extra', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
      case 'lump_sum':
        return { label: 'Lump Sum', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Payment History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-surface-elevated rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">{debt.nickname || debt.name}</p>
          <div className="flex justify-between items-end mt-1">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Total Paid</p>
              <p className="text-lg font-bold text-debt-good">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">Payments Made</p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{payments.length}</p>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Make your first payment to see it here!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {payments.map((payment) => {
              const typeInfo = getPaymentTypeLabel(payment.type);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border border-gray-100 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-elevated"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-debt-good/10 flex items-center justify-center text-debt-good">
                      💸
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(payment.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    {payment.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[120px] truncate">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-dark-surface-elevated text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDebtModal({ debt, onClose }: EditDebtModalProps) {
  const [name, setName] = useState(debt.name);
  const [nickname, setNickname] = useState(debt.nickname || '');
  const [currentBalance, setCurrentBalance] = useState(debt.currentBalance.toString());
  const [interestRate, setInterestRate] = useState(debt.interestRate.toString());
  const [minimumPayment, setMinimumPayment] = useState(debt.minimumPayment.toString());
  const [dueDay, setDueDay] = useState(debt.dueDay.toString());
  const [category, setCategory] = useState<DebtCategory>(debt.category);
  const [notes, setNotes] = useState(debt.notes || '');
  const [isPaused, setIsPaused] = useState(debt.isPaused);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { updateDebt } = useDebtStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Debt name is required';
    }

    const balanceNum = parseFloat(currentBalance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      newErrors.currentBalance = 'Balance must be $0 or higher';
    }

    const interestNum = parseFloat(interestRate);
    if (isNaN(interestNum) || interestNum < 0) {
      newErrors.interestRate = 'Interest rate must be 0% or higher';
    } else if (interestNum > 100) {
      newErrors.interestRate = 'Interest rate cannot exceed 100%';
    }

    const minPaymentNum = parseFloat(minimumPayment);
    if (isNaN(minPaymentNum) || minPaymentNum < 0) {
      newErrors.minimumPayment = 'Minimum payment must be $0 or higher';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateDebt(debt.id, {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      currentBalance: parseFloat(currentBalance),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
      dueDay: parseInt(dueDay),
      category,
      notes: notes.trim() || undefined,
      isPaused,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Edit {debt.nickname || debt.name}
        </h3>

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
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
              placeholder="A fun name to motivate you"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
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

          {/* Balance and Interest Rate */}
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
                  min="0"
                  value={currentBalance}
                  onChange={(e) => {
                    setCurrentBalance(e.target.value);
                    if (errors.currentBalance) setErrors((prev) => ({ ...prev, currentBalance: '' }));
                  }}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-dark-surface-elevated dark:text-gray-100 ${
                    errors.currentBalance ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-dark-border'
                  }`}
                  required
                />
              </div>
              {errors.currentBalance && (
                <p className="text-xs text-red-500 mt-1">{errors.currentBalance}</p>
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
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
              </div>
              {errors.interestRate && (
                <p className="text-xs text-red-500 mt-1">{errors.interestRate}</p>
              )}
            </div>
          </div>

          {/* Minimum Payment and Due Day */}
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

          {/* Pause Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-elevated rounded-lg">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">Pause Debt</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temporarily exclude from payoff calculations</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPaused ? 'bg-amber-500' : 'bg-gray-300 dark:bg-dark-border'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPaused ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DebtList() {
  const { debts, deleteDebt, getSortedDebts, strategy, getPaymentsByDebtId } = useDebtStore();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [historyDebt, setHistoryDebt] = useState<Debt | null>(null);
  const [showPaidOff, setShowPaidOff] = useState(false);

  const sortedActiveDebts = getSortedDebts();
  const paidOffDebts = debts.filter((d) => d.currentBalance === 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressPercent = (debt: Debt) => {
    return Math.round(
      ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100
    );
  };

  if (debts.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Debts Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Add your first debt to start tracking your progress and help Penny grow!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Your Debts</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {strategy.type === 'avalanche' ? '🔥 Highest interest first' : '❄️ Lowest balance first'}
          </span>
        </div>

        <div className="space-y-4">
          {sortedActiveDebts.map((debt, index) => (
            <div
              key={debt.id}
              className={`border rounded-xl p-4 ${
                index === 0 ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10' : 'border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {debt.nickname || debt.name}
                    </h3>
                    {index === 0 && !debt.isPaused && (
                      <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">
                        Target
                      </span>
                    )}
                    {debt.isPaused && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {categoryLabels[debt.category]} • {debt.interestRate}% APR
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-debt-danger">
                    {formatCurrency(debt.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    of {formatCurrency(debt.originalBalance)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-debt-good transition-all duration-300"
                    style={{ width: `${getProgressPercent(debt)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getProgressPercent(debt)}% paid off
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDebt(debt)}
                  className="flex-1 py-2 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm font-medium"
                >
                  Make Payment
                </button>
                <button
                  onClick={() => setHistoryDebt(debt)}
                  className="py-2 px-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors relative"
                  title="Payment history"
                >
                  📋
                  {getPaymentsByDebtId(debt.id).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {getPaymentsByDebtId(debt.id).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setEditingDebt(debt)}
                  className="py-2 px-3 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Edit debt"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${debt.nickname || debt.name}"? This cannot be undone.`)) {
                      deleteDebt(debt.id);
                    }
                  }}
                  className="py-2 px-3 text-gray-400 hover:text-debt-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete debt"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paid off debts toggle */}
        {paidOffDebts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={() => setShowPaidOff(!showPaidOff)}
              className="w-full flex items-center justify-between py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span>Paid Off Debts ({paidOffDebts.length})</span>
              <span>{showPaidOff ? '▲' : '▼'}</span>
            </button>

            {showPaidOff && (
              <div className="mt-2 space-y-2">
                {paidOffDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-3 bg-debt-paid/10 border border-debt-paid/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {debt.nickname || debt.name}
                      </span>
                    </div>
                    <span className="text-debt-paid font-medium">PAID OFF!</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedDebt && (
        <PaymentModal
          debt={selectedDebt}
          onClose={() => setSelectedDebt(null)}
        />
      )}

      {editingDebt && (
        <EditDebtModal
          debt={editingDebt}
          onClose={() => setEditingDebt(null)}
        />
      )}

      {historyDebt && (
        <PaymentHistoryModal
          debt={historyDebt}
          onClose={() => setHistoryDebt(null)}
        />
      )}
    </>
  );
}
