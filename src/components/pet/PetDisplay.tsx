/**
 * PetDisplay - Shows Penny the virtual pet with current stage and stats
 */

import { useState, useRef, useCallback } from 'react';
import { usePetStore } from '../../store';
import { useConfetti } from '../../hooks/useConfetti';
import { PET_APPEARANCES } from '../../types/pet';

const PAT_COOLDOWN_MS = 30000;

export function PetDisplay() {
  const { pet, getMood, getProgressToNextStage, getXpToNextStage, recordFeeding } = usePetStore();
  const { triggerSmall } = useConfetti();
  const [justPatted, setJustPatted] = useState(false);
  const lastPatRef = useRef(0);

  const mood = getMood();
  const progress = getProgressToNextStage();
  const xpToNext = getXpToNextStage();
  const appearance = PET_APPEARANCES[pet.stage];

  const handlePat = useCallback(() => {
    const now = Date.now();
    if (now - lastPatRef.current < PAT_COOLDOWN_MS) return;
    lastPatRef.current = now;
    recordFeeding();
    triggerSmall();
    setJustPatted(true);
    setTimeout(() => setJustPatted(false), 500);
  }, [recordFeeding, triggerSmall]);

  const sizeClasses = {
    sm: 'w-20 h-20 text-4xl',
    md: 'w-28 h-28 text-5xl',
    lg: 'w-36 h-36 text-6xl',
    xl: 'w-44 h-44 text-7xl',
  };

  const moodEmojis = {
    ecstatic: '(^o^)',
    happy: '(^_^)',
    content: '(-_-)',
    worried: '(o_o)',
    sad: '(T_T)',
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-lg">
      {/* Pet Avatar */}
      <div
        className={`
          ${sizeClasses[appearance.size]}
          ${appearance.color}
          rounded-full flex items-center justify-center
          shadow-inner pet-transition
          ${justPatted ? 'animate-pat-bounce' : 'animate-pulse'}
        `}
      >
        <span className="select-none">{appearance.emoji}</span>
      </div>

      {/* Pat Penny */}
      <button
        onClick={handlePat}
        className="mt-3 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50 active:scale-95 transition-all flex items-center gap-2"
        title="Pat Penny to boost happiness"
      >
        <span>❤️</span>
        <span>Pat {pet.name}</span>
      </button>

      {/* Pet Name and Stage */}
      <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">{pet.name}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pet.stage} Stage</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">{appearance.description}</p>

      {/* Mood Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg">{moodEmojis[mood.mood]}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{mood.reason}</span>
      </div>

      {/* Stats Bars */}
      <div className="w-full mt-4 space-y-2">
        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Evolution Progress</span>
            <span>{pet.xp} XP {xpToNext > 0 && `(${xpToNext} to next)`}</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Happiness */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Happiness</span>
            <span>{pet.happiness}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${pet.happiness}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Health</span>
            <span>{pet.health}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${pet.health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total XP */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Lifetime XP: {pet.totalXpEarned.toLocaleString()}
      </p>
    </div>
  );
}
