/**
 * Achievement Types for DebtPetApp
 * Defines all achievement badges and their requirements
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: AchievementCategory;
  isSecret?: boolean;
}

export type AchievementCategory =
  | 'getting_started'
  | 'payments'
  | 'milestones'
  | 'streaks'
  | 'pet_evolution'
  | 'mastery';

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
}

/**
 * All achievements available in the app
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Getting Started
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Add your first debt to start your journey',
    icon: '👣',
    xpReward: 25,
    category: 'getting_started',
  },

  // Payments
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Make your first payment',
    icon: '🩸',
    xpReward: 50,
    category: 'payments',
  },
  penny_pincher: {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Make 5 payments',
    icon: '🪙',
    xpReward: 75,
    category: 'payments',
  },

  // Milestones
  debt_slayer: {
    id: 'debt_slayer',
    name: 'Debt Slayer',
    description: 'Pay off your first debt completely',
    icon: '⚔️',
    xpReward: 200,
    category: 'milestones',
  },
  halfway_there: {
    id: 'halfway_there',
    name: 'Halfway There',
    description: 'Pay off 50% of any debt',
    icon: '🎯',
    xpReward: 100,
    category: 'milestones',
  },
  debt_free: {
    id: 'debt_free',
    name: 'Debt Free',
    description: 'Pay off ALL your debts - you did it!',
    icon: '🏆',
    xpReward: 1000,
    category: 'mastery',
  },

  // Streaks
  streak_master: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day payment streak',
    icon: '🔥',
    xpReward: 75,
    category: 'streaks',
  },

  // XP Milestones
  century_club: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Earn 100 XP total',
    icon: '💯',
    xpReward: 25,
    category: 'milestones',
  },

  // Pet Evolution Achievements
  dragon_tamer: {
    id: 'dragon_tamer',
    name: 'Dragon Tamer',
    description: 'Evolve Penny to Hatchling stage',
    icon: '🐣',
    xpReward: 50,
    category: 'pet_evolution',
  },
  rising_dragon: {
    id: 'rising_dragon',
    name: 'Rising Dragon',
    description: 'Evolve Penny to Juvenile stage',
    icon: '🐲',
    xpReward: 100,
    category: 'pet_evolution',
  },
  mighty_dragon: {
    id: 'mighty_dragon',
    name: 'Mighty Dragon',
    description: 'Evolve Penny to Adult stage',
    icon: '🐉',
    xpReward: 200,
    category: 'pet_evolution',
  },
  legendary_status: {
    id: 'legendary_status',
    name: 'Legendary Status',
    description: 'Evolve Penny to Legendary stage - the ultimate achievement!',
    icon: '✨',
    xpReward: 500,
    category: 'pet_evolution',
  },
};

/**
 * Get achievement by ID
 */
export const getAchievement = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS[id];
};

/**
 * Get all achievements in a category
 */
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
};

/**
 * Category display names and icons
 */
export const CATEGORY_INFO: Record<AchievementCategory, { name: string; icon: string }> = {
  getting_started: { name: 'Getting Started', icon: '🚀' },
  payments: { name: 'Payments', icon: '💸' },
  milestones: { name: 'Milestones', icon: '🏁' },
  streaks: { name: 'Streaks', icon: '🔥' },
  pet_evolution: { name: 'Pet Evolution', icon: '🐉' },
  mastery: { name: 'Mastery', icon: '👑' },
};
