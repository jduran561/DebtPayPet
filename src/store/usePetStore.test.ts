import { describe, it, expect, beforeEach } from 'vitest';
import { usePetStore } from './usePetStore';

// Reset store state before each test
beforeEach(() => {
  usePetStore.setState({
    hasCompletedOnboarding: false,
    pet: {
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
    },
    lastEvolution: null,
  });
});

describe('completeOnboarding', () => {
  it('sets hasCompletedOnboarding to true', () => {
    usePetStore.getState().completeOnboarding('Penny');
    expect(usePetStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('saves the provided name to pet.name', () => {
    usePetStore.getState().completeOnboarding('Sparky');
    expect(usePetStore.getState().pet.name).toBe('Sparky');
  });

  it('falls back to "Penny" if name is empty', () => {
    usePetStore.getState().completeOnboarding('   ');
    expect(usePetStore.getState().pet.name).toBe('Penny');
  });
});

describe('hasCompletedOnboarding initial state', () => {
  it('defaults to false', () => {
    expect(usePetStore.getState().hasCompletedOnboarding).toBe(false);
  });
});

describe('addXp', () => {
  it('increases both xp and totalXpEarned', () => {
    usePetStore.getState().addXp(50, 'test payment');
    const { pet } = usePetStore.getState();
    expect(pet.xp).toBe(50);
    expect(pet.totalXpEarned).toBe(50);
  });
});

describe('checkEvolution', () => {
  it('advances stage from egg to hatchling at 100 XP', () => {
    usePetStore.setState((s) => ({ pet: { ...s.pet, xp: 100 } }));
    usePetStore.getState().checkEvolution();
    expect(usePetStore.getState().pet.stage).toBe('hatchling');
  });

  it('does not evolve past legendary', () => {
    usePetStore.setState((s) => ({ pet: { ...s.pet, stage: 'legendary', xp: 99999 } }));
    const evolved = usePetStore.getState().checkEvolution();
    expect(evolved).toBe(false);
    expect(usePetStore.getState().pet.stage).toBe('legendary');
  });
});

describe('getProgressToNextStage', () => {
  it('returns 0 at the start of egg stage', () => {
    expect(usePetStore.getState().getProgressToNextStage()).toBe(0);
  });

  it('returns 50 when halfway between egg and hatchling', () => {
    usePetStore.setState((s) => ({ pet: { ...s.pet, xp: 50 } }));
    expect(usePetStore.getState().getProgressToNextStage()).toBe(50);
  });

  it('returns 100 when at legendary stage', () => {
    usePetStore.setState((s) => ({ pet: { ...s.pet, stage: 'legendary', xp: 10000 } }));
    expect(usePetStore.getState().getProgressToNextStage()).toBe(100);
  });
});
