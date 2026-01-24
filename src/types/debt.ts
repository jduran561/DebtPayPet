/**
 * Debt Types for DebtPetApp
 * Defines all TypeScript interfaces related to debt tracking
 */

export interface Debt {
  id: string;
  name: string;
  nickname?: string; // Optional friendly name (e.g., "The Beast" for a large debt)
  originalBalance: number; // Starting balance when debt was added
  currentBalance: number; // Current remaining balance
  interestRate: number; // Annual interest rate as a percentage (e.g., 18.99)
  minimumPayment: number; // Required minimum monthly payment
  dueDay: number; // Day of month payment is due (1-31)
  category: DebtCategory;
  createdAt: Date;
  updatedAt: Date;
  isPaused: boolean; // User can pause a debt temporarily
  notes?: string;
}

export type DebtCategory =
  | 'credit_card'
  | 'student_loan'
  | 'auto_loan'
  | 'personal_loan'
  | 'medical'
  | 'mortgage'
  | 'other';

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
  type: PaymentType;
  notes?: string;
}

export type PaymentType = 'minimum' | 'extra' | 'lump_sum';

export interface PayoffStrategy {
  type: 'avalanche' | 'snowball';
  monthlyBudget: number; // Total amount available for debt payments each month
}

export interface DebtSummary {
  totalDebt: number;
  totalMinimumPayments: number;
  averageInterestRate: number;
  highestInterestDebt: Debt | null;
  lowestBalanceDebt: Debt | null;
  estimatedPayoffDate: Date | null;
  totalInterestIfMinimum: number; // Interest paid if only paying minimums
  totalInterestWithStrategy: number; // Interest with current strategy
  interestSavings: number;
}

export interface MonthlyAllocation {
  debtId: string;
  debtName: string;
  amount: number;
  isMinimum: boolean;
  isExtraPayment: boolean;
}

// For tracking debt payoff milestones
export interface DebtMilestone {
  id: string;
  debtId: string;
  type: MilestoneType;
  targetAmount?: number;
  targetPercentage?: number;
  achievedAt?: Date;
  xpReward: number;
}

export type MilestoneType =
  | 'first_payment'
  | 'ten_percent_paid'
  | 'quarter_paid'
  | 'half_paid'
  | 'three_quarters_paid'
  | 'debt_free'
  | 'streak_7_days'
  | 'streak_30_days'
  | 'streak_90_days';
