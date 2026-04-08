import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDebtStore } from './useDebtStore';

const randomUuidMock = vi.fn();
vi.stubGlobal('crypto', {
  randomUUID: randomUuidMock,
});

const makeDebt = (overrides: Record<string, unknown> = {}) => ({
  name: 'Test Debt',
  originalBalance: 1000,
  currentBalance: 1000,
  interestRate: 15,
  minimumPayment: 25,
  dueDay: 15,
  category: 'credit_card' as const,
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-07T12:00:00.000Z'));
  randomUuidMock.mockReset();
  randomUuidMock.mockImplementation(() => `test-uuid-${randomUuidMock.mock.calls.length + 1}`);
  localStorage.clear();
  useDebtStore.setState({
    debts: [],
    payments: [],
    strategy: { type: 'avalanche', monthlyBudget: 0 },
  });
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe('addPayment', () => {
  it('reduces currentBalance by the payment amount', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt({ currentBalance: 500 }));
    useDebtStore.getState().addPayment({ debtId, amount: 100, date: new Date(), type: 'minimum' });
    expect(useDebtStore.getState().getDebtById(debtId)?.currentBalance).toBe(400);
  });

  it('does not let balance go below zero', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt({ currentBalance: 50 }));
    useDebtStore.getState().addPayment({ debtId, amount: 200, date: new Date(), type: 'lump_sum' });
    expect(useDebtStore.getState().getDebtById(debtId)?.currentBalance).toBe(0);
  });
});

describe('addDebt', () => {
  it('creates a debt with default isPaused=false and Date timestamps', () => {
    const id = useDebtStore.getState().addDebt(makeDebt());
    const debt = useDebtStore.getState().getDebtById(id);

    expect(id).toMatch(/^test-uuid-\d+$/);
    expect(debt?.id).toBe(id);
    expect(debt).toBeDefined();
    expect(debt?.isPaused).toBe(false);
    expect(debt?.createdAt).toBeInstanceOf(Date);
    expect(debt?.updatedAt).toBeInstanceOf(Date);
  });
});

describe('updateDebt', () => {
  it('updates provided fields and refreshes updatedAt', async () => {
    const id = useDebtStore.getState().addDebt(makeDebt({ name: 'Before', interestRate: 11 }));
    const beforeUpdate = useDebtStore.getState().getDebtById(id);

    useDebtStore.getState().updateDebt(id, { name: 'After', interestRate: 19 });
    const afterUpdate = useDebtStore.getState().getDebtById(id);

    expect(afterUpdate?.name).toBe('After');
    expect(afterUpdate?.interestRate).toBe(19);
    expect(afterUpdate?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate?.updatedAt.getTime() ?? 0
    );
  });
});

describe('deleteDebt', () => {
  it('removes the debt and all related payments', () => {
    const targetDebtId = useDebtStore.getState().addDebt(makeDebt({ name: 'Delete Me' }));
    const otherDebtId = useDebtStore.getState().addDebt(makeDebt({ name: 'Keep Me' }));

    useDebtStore
      .getState()
      .addPayment({ debtId: targetDebtId, amount: 50, date: new Date(), type: 'minimum' });
    useDebtStore
      .getState()
      .addPayment({ debtId: otherDebtId, amount: 20, date: new Date(), type: 'minimum' });

    useDebtStore.getState().deleteDebt(targetDebtId);

    expect(useDebtStore.getState().getDebtById(targetDebtId)).toBeUndefined();
    expect(useDebtStore.getState().getPaymentsByDebtId(targetDebtId)).toHaveLength(0);
    expect(useDebtStore.getState().getDebtById(otherDebtId)).toBeDefined();
    expect(useDebtStore.getState().getPaymentsByDebtId(otherDebtId)).toHaveLength(1);
  });
});

describe('getPaymentsByDebtId', () => {
  it('returns only payments matching the requested debt', () => {
    const debtA = useDebtStore.getState().addDebt(makeDebt({ name: 'A' }));
    const debtB = useDebtStore.getState().addDebt(makeDebt({ name: 'B' }));

    useDebtStore
      .getState()
      .addPayment({ debtId: debtA, amount: 10, date: new Date(), type: 'minimum' });
    useDebtStore
      .getState()
      .addPayment({ debtId: debtA, amount: 25, date: new Date(), type: 'extra' });
    useDebtStore
      .getState()
      .addPayment({ debtId: debtB, amount: 30, date: new Date(), type: 'minimum' });

    const paymentsA = useDebtStore.getState().getPaymentsByDebtId(debtA);
    const paymentsB = useDebtStore.getState().getPaymentsByDebtId(debtB);

    expect(paymentsA).toHaveLength(2);
    expect(paymentsB).toHaveLength(1);
    expect(paymentsA.every((p) => p.debtId === debtA)).toBe(true);
  });
});

describe('getSortedDebts', () => {
  it('returns highest-interest first when strategy is avalanche', () => {
    useDebtStore.getState().setStrategy({ type: 'avalanche', monthlyBudget: 0 });
    useDebtStore.getState().addDebt(makeDebt({ name: 'Low Rate', interestRate: 5 }));
    useDebtStore.getState().addDebt(makeDebt({ name: 'High Rate', interestRate: 20 }));
    useDebtStore.getState().addDebt(makeDebt({ name: 'Mid Rate', interestRate: 12 }));
    const sorted = useDebtStore.getState().getSortedDebts();
    expect(sorted.map((d) => d.interestRate)).toEqual([20, 12, 5]);
  });

  it('returns lowest-balance first when strategy is snowball', () => {
    useDebtStore.getState().setStrategy({ type: 'snowball', monthlyBudget: 0 });
    useDebtStore.getState().addDebt(makeDebt({ name: 'Big', currentBalance: 5000 }));
    useDebtStore.getState().addDebt(makeDebt({ name: 'Small', currentBalance: 200 }));
    useDebtStore.getState().addDebt(makeDebt({ name: 'Medium', currentBalance: 1000 }));
    const sorted = useDebtStore.getState().getSortedDebts();
    expect(sorted.map((d) => d.currentBalance)).toEqual([200, 1000, 5000]);
  });

  it('excludes paused and zero-balance debts', () => {
    useDebtStore.getState().setStrategy({ type: 'avalanche', monthlyBudget: 0 });
    useDebtStore.getState().addDebt(makeDebt({ name: 'Active', interestRate: 10, currentBalance: 300 }));
    const pausedDebtId = useDebtStore
      .getState()
      .addDebt(makeDebt({ name: 'Paused', interestRate: 30, currentBalance: 900 }));
    useDebtStore.getState().updateDebt(pausedDebtId, { isPaused: true });
    useDebtStore
      .getState()
      .addDebt(makeDebt({ name: 'Paid Off', interestRate: 50, currentBalance: 0 }));

    const sorted = useDebtStore.getState().getSortedDebts();

    expect(sorted).toHaveLength(1);
    expect(sorted[0].name).toBe('Active');
  });
});

describe('getTotalDebt', () => {
  it('sums all current balances', () => {
    useDebtStore.getState().addDebt(makeDebt({ currentBalance: 500 }));
    useDebtStore.getState().addDebt(makeDebt({ currentBalance: 300 }));
    useDebtStore.getState().addDebt(makeDebt({ currentBalance: 200 }));
    expect(useDebtStore.getState().getTotalDebt()).toBe(1000);
  });
});

describe('setStrategy', () => {
  it('updates strategy type and monthly budget', () => {
    useDebtStore.getState().setStrategy({ type: 'snowball', monthlyBudget: 1500 });
    expect(useDebtStore.getState().strategy).toEqual({
      type: 'snowball',
      monthlyBudget: 1500,
    });
  });
});

describe('addPayment edge behavior', () => {
  it('preserves payment Date instance on insert', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());
    const paymentDate = new Date('2026-04-05T12:00:00.000Z');
    const paymentId = useDebtStore.getState().addPayment({
      debtId,
      amount: 42,
      date: paymentDate,
      type: 'extra',
    });

    const payment = useDebtStore.getState().payments.find((p) => p.id === paymentId);
    expect(payment?.date).toBeInstanceOf(Date);
    expect(payment?.date.getTime()).toBe(paymentDate.getTime());
  });

  it('records payment even when debtId is not found', () => {
    const paymentId = useDebtStore
      .getState()
      .addPayment({
        debtId: 'missing-debt-id',
        amount: 30,
        date: new Date(),
        type: 'minimum',
      });

    const payment = useDebtStore.getState().payments.find((p) => p.id === paymentId);
    expect(paymentId).toMatch(/^test-uuid-\d+$/);
    expect(payment).toBeDefined();
    expect(payment?.id).toBe(paymentId);
    expect(payment?.debtId).toBe('missing-debt-id');
  });
});

describe('persist storage serialization', () => {
  it('rehydrates Date fields from localStorage payload', () => {
    const storageKey = 'debtpet-debts';
    const now = new Date('2026-01-15T12:00:00.000Z');
    const payload = {
      state: {
        debts: [
          {
            id: 'd-1',
            name: 'Stored Debt',
            originalBalance: 1000,
            currentBalance: 700,
            interestRate: 12,
            minimumPayment: 30,
            dueDay: 10,
            category: 'credit_card',
            isPaused: false,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        ],
        payments: [
          {
            id: 'p-1',
            debtId: 'd-1',
            amount: 50,
            date: now.toISOString(),
            type: 'minimum',
          },
        ],
        strategy: { type: 'avalanche', monthlyBudget: 0 },
      },
      version: 0,
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
    useDebtStore.persist.rehydrate();

    const debt = useDebtStore.getState().debts[0];
    const payment = useDebtStore.getState().payments[0];

    expect(debt.createdAt).toBeInstanceOf(Date);
    expect(debt.updatedAt).toBeInstanceOf(Date);
    expect(payment.date).toBeInstanceOf(Date);
  });
});

describe('getPaymentStreak', () => {
  const day = (offsetFromToday: number) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offsetFromToday);
    return d;
  };

  it('returns 0 when there are no payments', () => {
    expect(useDebtStore.getState().getPaymentStreak()).toBe(0);
  });

  it('counts consecutive days ending on the latest payment day', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());

    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-3), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-2), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-1), type: 'minimum' });

    expect(useDebtStore.getState().getPaymentStreak()).toBe(3);
  });

  it('ignores future-dated payments when calculating streak', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());

    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-1), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(1), type: 'minimum' });

    expect(useDebtStore.getState().getPaymentStreak()).toBe(1);
  });

  it('counts one day once even with multiple payments on same date', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());

    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(0), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 15, date: day(0), type: 'extra' });

    expect(useDebtStore.getState().getPaymentStreak()).toBe(1);
  });

  it('breaks streak when there is a missing day', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());

    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-3), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(-1), type: 'minimum' });

    expect(useDebtStore.getState().getPaymentStreak()).toBe(1);
  });

  it('returns 0 when all payments are future-dated', () => {
    const debtId = useDebtStore.getState().addDebt(makeDebt());

    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(1), type: 'minimum' });
    useDebtStore.getState().addPayment({ debtId, amount: 10, date: day(2), type: 'extra' });

    expect(useDebtStore.getState().getPaymentStreak()).toBe(0);
  });
});
