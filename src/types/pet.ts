/**
 * Pet Types for DebtPetApp
 * Defines Penny the virtual pet and evolution system
 */

export type PetStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'legendary';

export interface Pet {
  name: string; // Default is "Penny" but user can rename
  stage: PetStage;
  xp: number;
  totalXpEarned: number; // Lifetime XP (never decreases)
  happiness: number; // 0-100, affected by payment consistency
  health: number; // 0-100, affected by staying on track
  lastFed: Date; // Last time user made a payment
  createdAt: Date;
  evolutionHistory: EvolutionEvent[];
  accessories: string[]; // Unlocked accessories/customizations
  currentAccessory?: string;
}

export interface EvolutionEvent {
  fromStage: PetStage;
  toStage: PetStage;
  evolvedAt: Date;
  triggerMilestone: string; // What triggered the evolution
}

// XP thresholds for each evolution stage
export const EVOLUTION_THRESHOLDS: Record<PetStage, number> = {
  egg: 0,
  hatchling: 100, // First payment + some activity
  juvenile: 500, // Consistent payments, first debt milestone
  adult: 2000, // Multiple debts progress, good streaks
  legendary: 10000, // Debt-free or major accomplishments
};

// XP rewards for different actions
export const XP_REWARDS = {
  // Payment actions
  MINIMUM_PAYMENT: 10,
  EXTRA_PAYMENT: 25,
  LUMP_SUM_PAYMENT: 50,
  EARLY_PAYMENT: 15, // Paid before due date

  // Milestones
  FIRST_PAYMENT: 50,
  DEBT_10_PERCENT: 100,
  DEBT_25_PERCENT: 150,
  DEBT_50_PERCENT: 250,
  DEBT_75_PERCENT: 350,
  DEBT_PAID_OFF: 500,

  // Streaks
  STREAK_7_DAYS: 75,
  STREAK_30_DAYS: 200,
  STREAK_90_DAYS: 500,

  // Special achievements
  FIRST_DEBT_ADDED: 25,
  STRATEGY_SELECTED: 15,
  ALL_DEBTS_PAID: 1000,
} as const;

export interface PetMood {
  mood: 'ecstatic' | 'happy' | 'content' | 'worried' | 'sad';
  reason: string;
}

// Pet appearance data for each stage
export interface PetAppearance {
  stage: PetStage;
  emoji: string; // Fallback emoji representation
  description: string;
  color: string; // Tailwind color class
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export const PET_APPEARANCES: Record<PetStage, PetAppearance> = {
  egg: {
    stage: 'egg',
    emoji: '🥚',
    description: 'A mysterious egg full of potential',
    color: 'bg-penny-egg',
    size: 'sm',
  },
  hatchling: {
    stage: 'hatchling',
    emoji: '🐣',
    description: 'A tiny creature taking its first steps',
    color: 'bg-penny-hatchling',
    size: 'md',
  },
  juvenile: {
    stage: 'juvenile',
    emoji: '🐲',
    description: 'Growing stronger with every payment',
    color: 'bg-penny-juvenile',
    size: 'md',
  },
  adult: {
    stage: 'adult',
    emoji: '🐉',
    description: 'A powerful ally in your debt journey',
    color: 'bg-penny-adult',
    size: 'lg',
  },
  legendary: {
    stage: 'legendary',
    emoji: '✨🐉✨',
    description: 'A legendary dragon, debt destroyer!',
    color: 'bg-penny-legendary',
    size: 'xl',
  },
};

// Achievement type moved to types/achievements.ts for comprehensive definitions
