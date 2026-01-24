/**
 * DebtList - Shows all debts with ability to make payments
 */

import { useState } from 'react';
import { useDebtStore } from '../../store';
import { usePetStore } from '../../store';
import type { Debt, PaymentType } from '../../types/debt';
import { XP_REWARDS } from '../../types/pet';

interface PaymentModalProps {
  debt: Debt;
  onClose: () => void;
}

function PaymentModal({ debt, onClose }: PaymentModalProps) {
  const [amount, setAmount] = useState(debt.minimumPayment.toString());
  const [paymentType, setPaymentType] = useState<PaymentType>('minimum');
  const [notes, setNotes] = useState('');

  const { addPayment } = useDebtStore();
  const { addXp, recordFeeding } = usePetStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return;
    }

    // Add the payment
    addPayment({
      debtId: debt.id,
      amount: paymentAmount,
      date: new Date(),
      type: paymentType,
      notes: notes || undefined,
    });

    // Award XP based on payment type
    let xpAmount = XP_REWARDS.payment.minimum;
    if (paymentType === 'extra') {
      xpAmount = XP_REWARDS.payment.extra;
    } else if (paymentType === 'lump_sum') {
      xpAmount = XP_REWARDS.payment.lumpSum;
    }

    addXp(xpAmount, `${paymentType} payment on ${debt.name}`);
    recordFeeding();

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Make Payment on {debt.nickname || debt.name}
        </h3>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-debt-danger">
            ${debt.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'minimum', label: 'Minimum', xp: XP_REWARDS.payment.minimum },
                { value: 'extra', label: 'Extra', xp: XP_REWARDS.payment.extra },
                { value: 'lump_sum', label: 'Lump Sum', xp: XP_REWARDS.payment.lumpSum },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentType(option.value as PaymentType)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    paymentType === option.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  <span className="block text-xs opacity-75">+{option.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Any notes about this payment..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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

export function DebtList() {
  const { debts, deleteDebt, getSortedDebts, strategy } = useDebtStore();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
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
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Debts Yet</h3>
        <p className="text-gray-500">
          Add your first debt to start tracking your progress and help Penny grow!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Debts</h2>
          <span className="text-sm text-gray-500">
            {strategy.type === 'avalanche' ? '🔥 Highest interest first' : '❄️ Lowest balance first'}
          </span>
        </div>

        <div className="space-y-4">
          {sortedActiveDebts.map((debt, index) => (
            <div
              key={debt.id}
              className={`border rounded-xl p-4 ${
                index === 0 ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      {debt.nickname || debt.name}
                    </h3>
                    {index === 0 && (
                      <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">
                        Target
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {categoryLabels[debt.category]} • {debt.interestRate}% APR
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-debt-danger">
                    {formatCurrency(debt.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-400">
                    of {formatCurrency(debt.originalBalance)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-debt-good transition-all duration-300"
                    style={{ width: `${getProgressPercent(debt)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
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
                  onClick={() => {
                    if (confirm(`Delete "${debt.nickname || debt.name}"? This cannot be undone.`)) {
                      deleteDebt(debt.id);
                    }
                  }}
                  className="py-2 px-3 text-gray-400 hover:text-debt-danger hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowPaidOff(!showPaidOff)}
              className="w-full flex items-center justify-between py-2 text-sm text-gray-500 hover:text-gray-700"
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
                      <span className="font-medium text-gray-700">
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
    </>
  );
}
