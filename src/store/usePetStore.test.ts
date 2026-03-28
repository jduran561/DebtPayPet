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
