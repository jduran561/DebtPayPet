/**
 * Pet Store - Zustand slice for Penny the virtual pet
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet, PetStage, EvolutionEvent, PetMood } from '../types/pet';
import { EVOLUTION_THRESHOLDS } from '../types/pet';

// Evolution callback type for external listeners
type EvolutionCallback = (fromStage: PetStage, toStage: PetStage) => void;

// Global evolution listeners (outside store to avoid serialization issues)
const evolutionListeners: Set<EvolutionCallback> = new Set();

interface PetState {
  pet: Pet;
  lastEvolution: { from: PetStage; to: PetStage } | null; // Track last evolution for reactive updates

  // Actions
  addXp: (amount: number, reason: string) => void;
  updateHappiness: (delta: number) => void;
  updateHealth: (delta: number) => void;
  renamePet: (name: string) => void;
  checkEvolution: () => boolean; // Returns true if evolved
  recordFeeding: () => void;
  setAccessory: (accessory: string | undefined) => void;
  clearLastEvolution: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (name: string) => void;

  // Computed helpers
  getMood: () => PetMood;
  getXpToNextStage: () => number;
  getProgressToNextStage: () => number; // 0-100 percentage
}

// Subscribe to evolution events
export const subscribeToEvolution = (callback: EvolutionCallback): (() => void) => {
  evolutionListeners.add(callback);
  return () => evolutionListeners.delete(callback);
};

// Notify all evolution listeners
const notifyEvolutionListeners = (from: PetStage, to: PetStage) => {
  evolutionListeners.forEach(callback => callback(from, to));
};

const getNextStage = (currentStage: PetStage): PetStage | null => {
  const stages: PetStage[] = ['egg', 'hatchling', 'juvenile', 'adult', 'legendary'];
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex < stages.length - 1) {
    return stages[currentIndex + 1];
  }
  return null;
};

const createInitialPet = (): Pet => ({
  name: 'Penny',
  stage: 'egg',
  xp: 0,
  totalXpEarned: 0,
  happiness: 50,
  health: 100,
  lastFed: new Date(),
  createdAt: new Date(),
  evolutionHistory: [],
  accessories: [],
  currentAccessory: undefined,
});

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pet: createInitialPet(),
      lastEvolution: null,
      hasCompletedOnboarding: false,

      addXp: (amount, reason) => {
        set((state) => {
          const newXp = state.pet.xp + amount;
          const newTotalXp = state.pet.totalXpEarned + amount;

          console.log(`[Pet] +${amount} XP for: ${reason}. Total: ${newXp}`);

          return {
            pet: {
              ...state.pet,
              xp: newXp,
              totalXpEarned: newTotalXp,
            },
          };
        });

        // Check for evolution after adding XP
        get().checkEvolution();
      },

      updateHappiness: (delta) => {
        set((state) => ({
          pet: {
            ...state.pet,
            happiness: Math.max(0, Math.min(100, state.pet.happiness + delta)),
          },
        }));
      },

      updateHealth: (delta) => {
        set((state) => ({
          pet: {
            ...state.pet,
            health: Math.max(0, Math.min(100, state.pet.health + delta)),
          },
        }));
      },

      renamePet: (name) => {
        set((state) => ({
          pet: {
            ...state.pet,
            name: name.trim() || 'Penny',
          },
        }));
      },

      checkEvolution: () => {
        const { pet } = get();
        const nextStage = getNextStage(pet.stage);

        if (!nextStage) return false;

        const threshold = EVOLUTION_THRESHOLDS[nextStage];
        if (pet.xp >= threshold) {
          const evolutionEvent: EvolutionEvent = {
            fromStage: pet.stage,
            toStage: nextStage,
            evolvedAt: new Date(),
            triggerMilestone: `Reached ${threshold} XP`,
          };

          const fromStage = pet.stage;

          set((state) => ({
            pet: {
              ...state.pet,
              stage: nextStage,
              evolutionHistory: [...state.pet.evolutionHistory, evolutionEvent],
              happiness: Math.min(100, state.pet.happiness + 20), // Evolution joy!
            },
            lastEvolution: { from: fromStage, to: nextStage },
          }));

          console.log(`[Pet] EVOLVED from ${fromStage} to ${nextStage}!`);

          // Notify listeners about evolution
          notifyEvolutionListeners(fromStage, nextStage);

          return true;
        }

        return false;
      },

      clearLastEvolution: () => {
        set({ lastEvolution: null });
      },

      completeOnboarding: (name) => {
        set((state) => ({
          hasCompletedOnboarding: true,
          pet: {
            ...state.pet,
            name: name.trim() || 'Penny',
          },
        }));
      },

      recordFeeding: () => {
        set((state) => ({
          pet: {
            ...state.pet,
            lastFed: new Date(),
            happiness: Math.min(100, state.pet.happiness + 5),
          },
        }));
      },

      setAccessory: (accessory) => {
        set((state) => ({
          pet: {
            ...state.pet,
            currentAccessory: accessory,
          },
        }));
      },

      getMood: () => {
        const { pet } = get();
        const { happiness, health } = pet;
        const avgWellbeing = (happiness + health) / 2;

        // Check how long since last fed
        const daysSinceLastFed = Math.floor(
          (Date.now() - new Date(pet.lastFed).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (avgWellbeing >= 90) {
          return { mood: 'ecstatic', reason: 'Thriving on your progress!' };
        } else if (avgWellbeing >= 70) {
          return { mood: 'happy', reason: 'Feeling good about the journey!' };
        } else if (avgWellbeing >= 50) {
          return { mood: 'content', reason: 'Doing okay, keep going!' };
        } else if (avgWellbeing >= 30 || daysSinceLastFed > 7) {
          return { mood: 'worried', reason: 'Missing your payments...' };
        } else {
          return { mood: 'sad', reason: 'Needs attention and care' };
        }
      },

      getXpToNextStage: () => {
        const { pet } = get();
        const nextStage = getNextStage(pet.stage);
        if (!nextStage) return 0;
        return EVOLUTION_THRESHOLDS[nextStage] - pet.xp;
      },

      getProgressToNextStage: () => {
        const { pet } = get();
        const nextStage = getNextStage(pet.stage);
        if (!nextStage) return 100;

        const currentThreshold = EVOLUTION_THRESHOLDS[pet.stage];
        const nextThreshold = EVOLUTION_THRESHOLDS[nextStage];
        const xpInCurrentStage = pet.xp - currentThreshold;
        const xpNeededForStage = nextThreshold - currentThreshold;

        return Math.min(100, Math.round((xpInCurrentStage / xpNeededForStage) * 100));
      },
    }),
    {
      name: 'debtpet-pet',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Revive Date objects
          if (parsed.state?.pet) {
            parsed.state.pet.lastFed = new Date(parsed.state.pet.lastFed);
            parsed.state.pet.createdAt = new Date(parsed.state.pet.createdAt);
            parsed.state.pet.evolutionHistory = parsed.state.pet.evolutionHistory?.map(
              (e: EvolutionEvent) => ({
                ...e,
                evolvedAt: new Date(e.evolvedAt),
              })
            );
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
