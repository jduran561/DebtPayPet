/**
 * AchievementsPanel - Grid display of all achievements with filtering
 */

import { useState } from 'react';
import { useAchievementStore } from '../../store/useAchievementStore';
import { ACHIEVEMENTS, CATEGORY_INFO, type AchievementCategory } from '../../types/achievements';
import { AchievementBadge } from './AchievementBadge';

type FilterType = 'all' | 'unlocked' | 'locked';

export function AchievementsPanel() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const { isUnlocked, getUnlockDate, getUnlockedCount, getTotalCount, getProgress } =
    useAchievementStore();

  const achievements = Object.values(ACHIEVEMENTS);

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    // Filter by locked/unlocked status
    if (filter === 'unlocked' && !isUnlocked(achievement.id)) return false;
    if (filter === 'locked' && isUnlocked(achievement.id)) return false;

    // Filter by category
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;

    return true;
  });

  // Sort: unlocked first, then by category
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = isUnlocked(a.id);
    const bUnlocked = isUnlocked(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const progress = getProgress();

  const categories = Object.keys(CATEGORY_INFO) as AchievementCategory[];

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Achievements
          </h2>
          <div className="text-right">
            <span className="text-2xl font-bold text-brand-primary">
              {unlockedCount}
            </span>
            <span className="text-gray-400 dark:text-gray-500"> / {totalCount}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-4 bg-gray-200 dark:bg-dark-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
            {progress}% Complete
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'all', label: 'All' },
          { value: 'unlocked', label: 'Unlocked' },
          { value: 'locked', label: 'Locked' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as FilterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
            }`}
          >
            {tab.label}
            {tab.value === 'unlocked' && (
              <span className="ml-1 opacity-75">({unlockedCount})</span>
            )}
            {tab.value === 'locked' && (
              <span className="ml-1 opacity-75">({totalCount - unlockedCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand-secondary text-white'
              : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === cat
                ? 'bg-brand-secondary text-white'
                : 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
            }`}
          >
            <span>{CATEGORY_INFO[cat].icon}</span>
            <span>{CATEGORY_INFO[cat].name}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {sortedAchievements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">
            {filter === 'unlocked' ? '🔓' : '🔒'}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unlocked'
              ? 'No achievements unlocked yet. Keep going!'
              : filter === 'locked'
              ? 'Amazing! You have unlocked all achievements!'
              : 'No achievements in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked(achievement.id)}
              unlockDate={getUnlockDate(achievement.id)}
              size="md"
            />
          ))}
        </div>
      )}

      {/* Achievement Tips */}
      {unlockedCount < totalCount && (
        <div className="mt-6 p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span>💡</span> Tips to Unlock More
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {!isUnlocked('first_steps') && (
              <li>- Add your first debt to earn the "First Steps" badge</li>
            )}
            {!isUnlocked('first_blood') && isUnlocked('first_steps') && (
              <li>- Make your first payment to earn "First Blood"</li>
            )}
            {!isUnlocked('penny_pincher') && isUnlocked('first_blood') && (
              <li>- Make 5 total payments for "Penny Pincher"</li>
            )}
            {!isUnlocked('streak_master') && (
              <li>- Make payments on 7 consecutive days for "Streak Master"</li>
            )}
            {!isUnlocked('halfway_there') && (
              <li>- Pay off 50% of any debt for "Halfway There"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AchievementsPanel;
