/**
 * Achievement Store - Zustand slice for achievement/badge system
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UnlockedAchievement } from '../types/achievements';
import { ACHIEVEMENTS, getAchievement } from '../types/achievements';

interface AchievementState {
  unlockedAchievements: UnlockedAchievement[];
  // Queue for showing achievement popups
  pendingNotifications: string[];
  // Stats for tracking progress
  totalPayments: number;
  paymentStreak: number;
  lastPaymentDate: Date | null;

  // Actions
  unlockAchievement: (achievementId: string) => boolean; // Returns true if newly unlocked
  isUnlocked: (achievementId: string) => boolean;
  getUnlockDate: (achievementId: string) => Date | null;
  consumeNotification: () => string | null; // Get and remove first pending notification

  // Progress tracking
  incrementPayments: () => void;
  updateStreak: () => void;
  resetStreak: () => void;

  // Computed
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getProgress: () => number; // 0-100 percentage
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      pendingNotifications: [],
      totalPayments: 0,
      paymentStreak: 0,
      lastPaymentDate: null,

      unlockAchievement: (achievementId) => {
        const { unlockedAchievements } = get();

        // Check if already unlocked
        if (unlockedAchievements.some(a => a.achievementId === achievementId)) {
          return false;
        }

        // Verify achievement exists
        const achievement = getAchievement(achievementId);
        if (!achievement) {
          console.warn(`[Achievements] Unknown achievement ID: ${achievementId}`);
          return false;
        }

        const newUnlock: UnlockedAchievement = {
          achievementId,
          unlockedAt: new Date(),
        };

        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, newUnlock],
          pendingNotifications: [...state.pendingNotifications, achievementId],
        }));

        console.log(`[Achievements] Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`);
        return true;
      },

      isUnlocked: (achievementId) => {
        return get().unlockedAchievements.some(a => a.achievementId === achievementId);
      },

      getUnlockDate: (achievementId) => {
        const unlock = get().unlockedAchievements.find(a => a.achievementId === achievementId);
        return unlock ? unlock.unlockedAt : null;
      },

      consumeNotification: () => {
        const { pendingNotifications } = get();
        if (pendingNotifications.length === 0) return null;

        const [next, ...rest] = pendingNotifications;
        set({ pendingNotifications: rest });
        return next;
      },

      incrementPayments: () => {
        set((state) => ({
          totalPayments: state.totalPayments + 1,
        }));
      },

      updateStreak: () => {
        const { lastPaymentDate, paymentStreak } = get();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (!lastPaymentDate) {
          // First payment ever
          set({
            paymentStreak: 1,
            lastPaymentDate: now,
          });
          return;
        }

        const lastDate = new Date(lastPaymentDate);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Same day, just update the date
          set({ lastPaymentDate: now });
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          set({
            paymentStreak: paymentStreak + 1,
            lastPaymentDate: now,
          });
        } else {
          // Streak broken, reset to 1
          set({
            paymentStreak: 1,
            lastPaymentDate: now,
          });
        }
      },

      resetStreak: () => {
        set({
          paymentStreak: 0,
          lastPaymentDate: null,
        });
      },

      getUnlockedCount: () => {
        return get().unlockedAchievements.length;
      },

      getTotalCount: () => {
        return Object.keys(ACHIEVEMENTS).length;
      },

      getProgress: () => {
        const total = Object.keys(ACHIEVEMENTS).length;
        const unlocked = get().unlockedAchievements.length;
        return total > 0 ? Math.round((unlocked / total) * 100) : 0;
      },
    }),
    {
      name: 'debtpet-achievements',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Revive Date objects
          if (parsed.state) {
            parsed.state.unlockedAchievements = parsed.state.unlockedAchievements?.map(
              (a: UnlockedAchievement) => ({
                ...a,
                unlockedAt: new Date(a.unlockedAt),
              })
            );
            if (parsed.state.lastPaymentDate) {
              parsed.state.lastPaymentDate = new Date(parsed.state.lastPaymentDate);
            }
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
