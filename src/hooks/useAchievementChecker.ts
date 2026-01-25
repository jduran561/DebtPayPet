/**
 * Achievement Checker Hook
 * Checks and unlocks achievements based on current app state
 */

import { useCallback } from 'react';
import { useAchievementStore } from '../store/useAchievementStore';
import { useDebtStore } from '../store/useDebtStore';
import { usePetStore } from '../store/usePetStore';
import type { PetStage } from '../types/pet';

/**
 * Hook that provides methods to check and unlock achievements
 */
export const useAchievementChecker = () => {
  const {
    unlockAchievement,
    isUnlocked,
    incrementPayments,
    updateStreak,
    totalPayments,
    paymentStreak,
  } = useAchievementStore();

  const { debts, payments } = useDebtStore();
  const { pet } = usePetStore();

  /**
   * Check all achievements based on current state
   * Call this after any action that might unlock an achievement
   */
  const checkAllAchievements = useCallback(() => {
    // First Steps - Add your first debt
    if (debts.length > 0 && !isUnlocked('first_steps')) {
      unlockAchievement('first_steps');
    }

    // First Blood - Make your first payment
    if (payments.length > 0 && !isUnlocked('first_blood')) {
      unlockAchievement('first_blood');
    }

    // Penny Pincher - 5 payments
    if (totalPayments >= 5 && !isUnlocked('penny_pincher')) {
      unlockAchievement('penny_pincher');
    }

    // Streak Master - 7-day streak
    if (paymentStreak >= 7 && !isUnlocked('streak_master')) {
      unlockAchievement('streak_master');
    }

    // Century Club - 100 XP
    if (pet.totalXpEarned >= 100 && !isUnlocked('century_club')) {
      unlockAchievement('century_club');
    }

    // Check debt milestone achievements
    checkDebtMilestones();

    // Check pet evolution achievements
    checkPetEvolution(pet.stage);
  }, [
    debts,
    payments,
    totalPayments,
    paymentStreak,
    pet.totalXpEarned,
    pet.stage,
    isUnlocked,
    unlockAchievement,
  ]);

  /**
   * Check debt-related milestone achievements
   */
  const checkDebtMilestones = useCallback(() => {
    // Halfway There - 50% of any debt paid
    for (const debt of debts) {
      const percentPaid = ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100;
      if (percentPaid >= 50 && !isUnlocked('halfway_there')) {
        unlockAchievement('halfway_there');
        break;
      }
    }

    // Debt Slayer - Pay off first debt
    const paidOffDebts = debts.filter((d) => d.currentBalance === 0);
    if (paidOffDebts.length > 0 && !isUnlocked('debt_slayer')) {
      unlockAchievement('debt_slayer');
    }

    // Debt Free - All debts paid off
    if (debts.length > 0 && debts.every((d) => d.currentBalance === 0) && !isUnlocked('debt_free')) {
      unlockAchievement('debt_free');
    }
  }, [debts, isUnlocked, unlockAchievement]);

  /**
   * Check pet evolution achievements
   */
  const checkPetEvolution = useCallback(
    (stage: PetStage) => {
      const evolutionAchievements: Record<PetStage, string | null> = {
        egg: null,
        hatchling: 'dragon_tamer',
        juvenile: 'rising_dragon',
        adult: 'mighty_dragon',
        legendary: 'legendary_status',
      };

      const achievementId = evolutionAchievements[stage];
      if (achievementId && !isUnlocked(achievementId)) {
        unlockAchievement(achievementId);
      }
    },
    [isUnlocked, unlockAchievement]
  );

  /**
   * Call when a payment is made
   */
  const onPaymentMade = useCallback(() => {
    incrementPayments();
    updateStreak();

    // Re-check achievements after updating stats
    setTimeout(checkAllAchievements, 0);
  }, [incrementPayments, updateStreak, checkAllAchievements]);

  /**
   * Call when a debt is added
   */
  const onDebtAdded = useCallback(() => {
    setTimeout(checkAllAchievements, 0);
  }, [checkAllAchievements]);

  /**
   * Call when pet evolves
   */
  const onPetEvolved = useCallback(
    (newStage: PetStage) => {
      checkPetEvolution(newStage);
    },
    [checkPetEvolution]
  );

  return {
    checkAllAchievements,
    checkDebtMilestones,
    checkPetEvolution,
    onPaymentMade,
    onDebtAdded,
    onPetEvolved,
  };
};

export default useAchievementChecker;
