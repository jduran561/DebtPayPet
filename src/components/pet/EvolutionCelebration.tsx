/**
 * EvolutionCelebration - Listens for pet evolution and triggers celebrations
 */

import { useEffect } from 'react';
import { usePetStore, subscribeToEvolution } from '../../store/usePetStore';
import { useAchievementChecker } from '../../hooks/useAchievementChecker';
import { useConfetti } from '../../hooks/useConfetti';
import type { PetStage } from '../../types/pet';

export function EvolutionCelebration() {
  const { lastEvolution, clearLastEvolution } = usePetStore();
  const { onPetEvolved } = useAchievementChecker();
  const { triggerGold, triggerMassive } = useConfetti();

  // Subscribe to evolution events
  useEffect(() => {
    const unsubscribe = subscribeToEvolution((fromStage: PetStage, toStage: PetStage) => {
      console.log(`[EvolutionCelebration] Pet evolved from ${fromStage} to ${toStage}`);

      // Trigger confetti based on stage
      if (toStage === 'legendary') {
        // Legendary evolution gets massive celebration
        triggerMassive();
      } else {
        // Other evolutions get gold confetti
        triggerGold();
      }

      // Check for evolution achievements
      onPetEvolved(toStage);
    });

    return unsubscribe;
  }, [onPetEvolved, triggerGold, triggerMassive]);

  // Clear last evolution after it's been processed
  useEffect(() => {
    if (lastEvolution) {
      // Give time for animations
      const timer = setTimeout(() => {
        clearLastEvolution();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastEvolution, clearLastEvolution]);

  // This component doesn't render anything visible
  return null;
}

export default EvolutionCelebration;
