/**
 * AchievementBadge - Display individual achievement (locked/unlocked state)
 */

import type { Achievement } from '../../types/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockDate?: Date | null;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function AchievementBadge({
  achievement,
  isUnlocked,
  unlockDate,
  size = 'md',
  showDetails = true,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      icon: 'text-2xl',
      title: 'text-xs',
      description: 'text-[10px]',
      xp: 'text-[10px]',
    },
    md: {
      container: 'p-4',
      icon: 'text-4xl',
      title: 'text-sm',
      description: 'text-xs',
      xp: 'text-xs',
    },
    lg: {
      container: 'p-6',
      icon: 'text-5xl',
      title: 'text-base',
      description: 'text-sm',
      xp: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`
        ${classes.container}
        rounded-xl border-2 transition-all duration-300
        ${
          isUnlocked
            ? 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 border-amber-300 dark:border-amber-600 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30'
            : 'bg-gray-100 dark:bg-dark-surface-elevated border-gray-200 dark:border-dark-border opacity-60'
        }
      `}
    >
      {/* Badge Icon */}
      <div className="text-center mb-2">
        <span
          className={`
            ${classes.icon}
            ${isUnlocked ? '' : 'grayscale opacity-40'}
            inline-block
            ${isUnlocked ? 'animate-bounce-subtle' : ''}
          `}
          role="img"
          aria-label={achievement.name}
        >
          {isUnlocked ? achievement.icon : '🔒'}
        </span>
      </div>

      {showDetails && (
        <>
          {/* Achievement Name */}
          <h4
            className={`
              ${classes.title}
              font-bold text-center
              ${isUnlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            {achievement.name}
          </h4>

          {/* Description */}
          <p
            className={`
              ${classes.description}
              text-center mt-1
              ${isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            {achievement.description}
          </p>

          {/* XP Reward / Unlock Date */}
          <div className={`${classes.xp} text-center mt-2`}>
            {isUnlocked && unlockDate ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Unlocked {formatDate(unlockDate)}
              </span>
            ) : (
              <span className="text-brand-primary font-medium">
                +{achievement.xpReward} XP
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact badge for inline display
 */
export function AchievementBadgeCompact({
  achievement,
  isUnlocked,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
}) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        ${
          isUnlocked
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
            : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-400 dark:text-gray-500'
        }
      `}
      title={achievement.description}
    >
      <span className={`text-lg ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
        {isUnlocked ? achievement.icon : '🔒'}
      </span>
      <span className="text-sm font-medium">{achievement.name}</span>
    </div>
  );
}

export default AchievementBadge;
