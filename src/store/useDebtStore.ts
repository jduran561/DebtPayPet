/**
 * Debt Store - Zustand slice for debt management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Debt, Payment, PayoffStrategy } from '../types/debt';

interface DebtState {
  debts: Debt[];
  payments: Payment[];
  strategy: PayoffStrategy;

  // Actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'isPaused'>) => string;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => string;
  setStrategy: (strategy: PayoffStrategy) => void;

  // Computed helpers
  getTotalDebt: () => number;
  getDebtById: (id: string) => Debt | undefined;
  getPaymentsByDebtId: (debtId: string) => Payment[];
  getSortedDebts: () => Debt[]; // Sorted by strategy (avalanche or snowball)
  getPaymentStreak: () => number; // Consecutive days with at least one payment
}

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

export const useDebtStore = create<DebtState>()(
  persist(
    (set, get) => ({
      debts: [],
      payments: [],
      strategy: {
        type: 'avalanche',
        monthlyBudget: 0,
      },

      addDebt: (debtData) => {
        const id = generateId();
        const now = new Date();
        const newDebt: Debt = {
          ...debtData,
          id,
          createdAt: now,
          updatedAt: now,
          isPaused: false,
        };

        set((state) => ({
          debts: [...state.debts, newDebt],
        }));

        return id;
      },

      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id
              ? { ...debt, ...updates, updatedAt: new Date() }
              : debt
          ),
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
          payments: state.payments.filter((payment) => payment.debtId !== id),
        }));
      },

      addPayment: (paymentData) => {
        const id = generateId();
        const newPayment: Payment = {
          ...paymentData,
          id,
        };

        // Update the debt's current balance
        const debt = get().debts.find((d) => d.id === paymentData.debtId);
        if (debt) {
          const newBalance = Math.max(0, debt.currentBalance - paymentData.amount);
          get().updateDebt(paymentData.debtId, { currentBalance: newBalance });
        }

        set((state) => ({
          payments: [...state.payments, newPayment],
        }));

        return id;
      },

      setStrategy: (strategy) => {
        set({ strategy });
      },

      getTotalDebt: () => {
        return get().debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
      },

      getDebtById: (id) => {
        return get().debts.find((debt) => debt.id === id);
      },

      getPaymentsByDebtId: (debtId) => {
        return get().payments.filter((payment) => payment.debtId === debtId);
      },

      getSortedDebts: () => {
        const { debts, strategy } = get();
        const activeDebts = debts.filter(
          (debt) => !debt.isPaused && debt.currentBalance > 0
        );

        if (strategy.type === 'avalanche') {
          // Highest interest rate first
          return [...activeDebts].sort((a, b) => b.interestRate - a.interestRate);
        } else {
          // Lowest balance first (snowball)
          return [...activeDebts].sort(
            (a, b) => a.currentBalance - b.currentBalance
          );
        }
      },

      getPaymentStreak: () => {
        const { payments } = get();
        const toDateStr = (d: Date) => {
          const x = new Date(d);
          return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
        };
        const paymentDates = new Set(payments.map((p) => toDateStr(p.date)));
        if (paymentDates.size === 0) return 0;

        const todayStr = toDateStr(new Date());
        const onOrBeforeToday = [...paymentDates].filter((s) => s <= todayStr);
        if (onOrBeforeToday.length === 0) return 0;
        const maxStr = onOrBeforeToday.sort().reverse()[0];

        let count = 0;
        let d = new Date(maxStr + 'T12:00:00');
        while (paymentDates.has(toDateStr(d))) {
          count++;
          d.setDate(d.getDate() - 1);
        }
        return count;
      },
    }),
    {
      name: 'debtpet-debts',
      // Custom serialization for Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Revive Date objects
          if (parsed.state) {
            parsed.state.debts = parsed.state.debts?.map((d: Debt) => ({
              ...d,
              createdAt: new Date(d.createdAt),
              updatedAt: new Date(d.updatedAt),
            }));
            parsed.state.payments = parsed.state.payments?.map((p: Payment) => ({
              ...p,
              date: new Date(p.date),
            }));
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
    }
  )
);
