/**
 * PetDisplay - Shows Penny the virtual pet with current stage and stats
 */

import { usePetStore } from '../../store';
import { PET_APPEARANCES } from '../../types/pet';

export function PetDisplay() {
  const { pet, getMood, getProgressToNextStage, getXpToNextStage } = usePetStore();
  const mood = getMood();
  const progress = getProgressToNextStage();
  const xpToNext = getXpToNextStage();
  const appearance = PET_APPEARANCES[pet.stage];

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
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg">
      {/* Pet Avatar */}
      <div
        className={`
          ${sizeClasses[appearance.size]}
          ${appearance.color}
          rounded-full flex items-center justify-center
          shadow-inner pet-transition
          animate-pulse
        `}
      >
        <span className="select-none">{appearance.emoji}</span>
      </div>

      {/* Pet Name and Stage */}
      <h2 className="mt-4 text-2xl font-bold text-gray-800">{pet.name}</h2>
      <p className="text-sm text-gray-500 capitalize">{pet.stage} Stage</p>
      <p className="text-xs text-gray-400 italic mt-1">{appearance.description}</p>

      {/* Mood Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg">{moodEmojis[mood.mood]}</span>
        <span className="text-sm text-gray-600">{mood.reason}</span>
      </div>

      {/* Stats Bars */}
      <div className="w-full mt-4 space-y-2">
        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Evolution Progress</span>
            <span>{pet.xp} XP {xpToNext > 0 && `(${xpToNext} to next)`}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Happiness */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Happiness</span>
            <span>{pet.happiness}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${pet.happiness}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Health</span>
            <span>{pet.health}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${pet.health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total XP */}
      <p className="mt-4 text-xs text-gray-400">
        Lifetime XP: {pet.totalXpEarned.toLocaleString()}
      </p>
    </div>
  );
}
