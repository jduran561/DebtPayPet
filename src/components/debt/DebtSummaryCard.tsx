/**
 * DebtSummaryCard - Shows overview of all debts
 */

import { useDebtStore } from '../../store';

export function DebtSummaryCard() {
  const { debts, getTotalDebt, getPaymentStreak, strategy } = useDebtStore();
  const totalDebt = getTotalDebt();
  const streak = getPaymentStreak();
  const activeDebts = debts.filter((d) => !d.isPaused && d.currentBalance > 0);
  const paidOffDebts = debts.filter((d) => d.currentBalance === 0);

  const totalMinimumPayments = activeDebts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const averageInterestRate =
    activeDebts.length > 0
      ? activeDebts.reduce((sum, debt) => sum + debt.interestRate, 0) /
        activeDebts.length
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Debt Overview</h2>

      {debts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No debts added yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Add your first debt to start your journey!
          </p>
        </div>
      ) : (
        <>
          {/* Payment Streak */}
          {streak > 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center justify-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-semibold text-amber-800 dark:text-amber-200">
                {streak} day payment streak!
              </span>
            </div>
          )}

          {/* Total Debt */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Debt</p>
            <p className="text-4xl font-bold text-debt-danger">
              {formatCurrency(totalDebt)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Debts</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {activeDebts.length}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Paid Off</p>
              <p className="text-2xl font-semibold text-debt-paid">
                {paidOffDebts.length}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Min. Payments</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {formatCurrency(totalMinimumPayments)}
                <span className="text-xs text-gray-400 dark:text-gray-500">/mo</span>
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Interest</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {averageInterestRate.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Strategy Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payoff Strategy</span>
              <span className="text-sm font-medium text-brand-primary capitalize">
                {strategy.type} Method
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {strategy.type === 'avalanche'
                ? 'Targeting highest interest first to minimize total interest paid'
                : 'Targeting smallest balance first for quick wins'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
