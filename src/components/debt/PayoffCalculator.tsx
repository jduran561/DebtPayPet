/**
 * PayoffCalculator - Estimates debt payoff dates and interest savings
 */

import { useDebtStore } from '../../store';
import type { Debt } from '../../types/debt';

interface PayoffEstimate {
  debt: Debt;
  monthsToPayoff: number;
  payoffDate: Date;
  totalInterest: number;
  totalPayment: number;
}

function calculatePayoffEstimate(debt: Debt, extraMonthlyPayment: number = 0): PayoffEstimate {
  const monthlyRate = debt.interestRate / 100 / 12;
  const monthlyPayment = debt.minimumPayment + extraMonthlyPayment;

  let balance = debt.currentBalance;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 360; // 30 years max

  while (balance > 0 && months < maxMonths) {
    const interestCharge = balance * monthlyRate;
    totalInterest += interestCharge;

    const principalPayment = Math.min(monthlyPayment - interestCharge, balance);

    if (principalPayment <= 0) {
      // Payment doesn't cover interest - will never pay off
      months = maxMonths;
      break;
    }

    balance = Math.max(0, balance - principalPayment);
    months++;
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    debt,
    monthsToPayoff: months,
    payoffDate,
    totalInterest,
    totalPayment: debt.currentBalance + totalInterest,
  };
}

function formatMonths(months: number): string {
  if (months >= 360) {
    return '30+ years';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years}y ${remainingMonths}m`;
}

export function PayoffCalculator() {
  const { debts, strategy } = useDebtStore();

  const activeDebts = debts.filter(d => d.currentBalance > 0 && !d.isPaused);

  if (activeDebts.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 text-center">
        <div className="text-4xl mb-2">🧮</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Payoff Calculator</h3>
        <p className="text-gray-500 dark:text-gray-400">Add debts to see your payoff estimates</p>
      </div>
    );
  }

  const estimates = activeDebts.map(debt => calculatePayoffEstimate(debt));

  // Sort by strategy
  const sortedEstimates = [...estimates].sort((a, b) => {
    if (strategy.type === 'avalanche') {
      return b.debt.interestRate - a.debt.interestRate;
    }
    return a.debt.currentBalance - b.debt.currentBalance;
  });

  // Calculate totals
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayments = activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalInterestMinimums = estimates.reduce((sum, e) => sum + e.totalInterest, 0);

  // Calculate with $100 extra payment on target debt
  const extraPaymentAmount = 100;
  const estimatesWithExtra = activeDebts.map((debt) => {
    // Apply extra payment to target debt (first in sorted order)
    const isTarget = sortedEstimates[0]?.debt.id === debt.id;
    return calculatePayoffEstimate(debt, isTarget ? extraPaymentAmount : 0);
  });
  const totalInterestWithExtra = estimatesWithExtra.reduce((sum, e) => sum + e.totalInterest, 0);
  const interestSavings = totalInterestMinimums - totalInterestWithExtra;

  // Find last payoff date
  const lastPayoffDate = estimates.reduce((latest, e) => {
    return e.payoffDate > latest ? e.payoffDate : latest;
  }, new Date());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payoff Calculator</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Debt</p>
          <p className="text-lg font-bold text-debt-danger">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Minimums</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{formatCurrency(totalMinPayments)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Debt-Free Date</p>
          <p className="text-lg font-bold text-brand-primary">{formatDate(lastPayoffDate)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Interest</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-500">{formatCurrency(totalInterestMinimums)}</p>
        </div>
      </div>

      {/* Savings Tip */}
      {interestSavings > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                Pay ${extraPaymentAmount} extra monthly on your target debt
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                You could save <span className="font-bold">{formatCurrency(interestSavings)}</span> in interest!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Debt Estimates */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Individual Payoff Estimates
        </h3>

        {sortedEstimates.map((estimate, index) => {
          const progressPercent = Math.round(
            ((estimate.debt.originalBalance - estimate.debt.currentBalance) / estimate.debt.originalBalance) * 100
          );

          return (
            <div
              key={estimate.debt.id}
              className={`border rounded-lg p-4 ${
                index === 0 ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10' : 'border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      {estimate.debt.nickname || estimate.debt.name}
                    </h4>
                    {index === 0 && (
                      <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">
                        Target
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {estimate.debt.interestRate}% APR
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {formatCurrency(estimate.debt.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {progressPercent}% paid
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-debt-good transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Payoff in:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {formatMonths(estimate.monthsToPayoff)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Interest:</span>{' '}
                  <span className="font-medium text-amber-600 dark:text-amber-500">
                    {formatCurrency(estimate.totalInterest)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Free by:</span>{' '}
                  <span className="font-medium text-brand-primary">
                    {formatDate(estimate.payoffDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        Estimates based on current balances and minimum payments. Actual results may vary.
      </p>
    </div>
  );
}
