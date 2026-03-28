/**
 * DebtPetApp - Main Application Component
 * A gamified debt management app with Penny the virtual pet
 */

import { useState, useEffect } from 'react';
import {
  PetDisplay,
  DebtSummaryCard,
  DebtList,
  AddDebtForm,
  StrategySelector,
  PayoffCalculator,
  NotificationSettings,
  ReminderBanner,
  ThemeToggle,
  AchievementsPanel,
  AchievementToast,
  EvolutionCelebration,
  PennySays,
} from './components';
import { useDebtStore, usePetStore } from './store';
import { useAchievementChecker } from './hooks/useAchievementChecker';
import { PET_APPEARANCES } from './types/pet';

type Tab = 'dashboard' | 'debts' | 'strategy' | 'achievements' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddDebt, setShowAddDebt] = useState(false);
  const { debts } = useDebtStore();
  const { pet } = usePetStore();
  const headerEmoji = PET_APPEARANCES[pet.stage].emoji;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'dashboard', label: 'Home', emoji: '🏠' },
    { id: 'debts', label: 'Debts', emoji: '💳' },
    { id: 'strategy', label: 'Strategy', emoji: '📊' },
    { id: 'achievements', label: 'Badges', emoji: '🏆' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];

  // Achievement checker hook
  const { checkAllAchievements } = useAchievementChecker();

  // Check achievements on mount and when debts change
  useEffect(() => {
    checkAllAchievements();
  }, [debts, checkAllAchievements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{headerEmoji}</span>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">DebtPet</h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Pay off debt. Grow Penny.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setShowAddDebt(true)}
                className="w-9 h-9 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors font-bold text-xl flex items-center justify-center shadow-md"
                aria-label="Add Debt"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — padded so it clears the fixed bottom nav */}
      <main className="max-w-4xl mx-auto px-4 pt-5 pb-24">
        {/* Reminder Banner - shows on all tabs */}
        <ReminderBanner />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <PennySays />
            {/* Pet and Summary side by side on larger screens */}
            <div className="grid md:grid-cols-2 gap-6">
              <PetDisplay />
              <DebtSummaryCard />
            </div>

            {/* Quick Actions */}
            {debts.length === 0 ? (
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome to DebtPet!</h2>
                <p className="mb-4 opacity-90">
                  Start your debt-free journey by adding your first debt. Penny is ready to grow with you!
                </p>
                <button
                  onClick={() => setShowAddDebt(true)}
                  className="px-6 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Add Your First Debt
                </button>
              </div>
            ) : (
              <DebtList />
            )}
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="space-y-6">
            <DebtList />
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <StrategySelector />

            <PayoffCalculator />

            {/* Strategy Tips */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payoff Tips</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Pay More Than Minimum</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Even small extra payments can save you thousands in interest and speed up your debt-free date.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Focus on One Debt</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      While paying minimums on all debts, put extra money toward your target debt (shown with "Target" badge).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">The Debt Snowball Effect</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When you pay off a debt, roll that payment amount into your next target debt. Your "snowball" gets bigger over time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl">🐉</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Keep Penny Happy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Regular payments keep Penny happy and healthy. Watch Penny evolve as you make progress on your debt-free journey!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <AchievementsPanel />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <NotificationSettings />
          </div>
        )}
      </main>

      {/* Bottom Tab Navigation — iOS-style fixed bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border z-40">
        <div className="flex max-w-4xl mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                activeTab === tab.id
                  ? 'text-brand-primary'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`text-2xl leading-none transition-transform duration-150 ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`}>
                {tab.emoji}
              </span>
              <span className={`text-[10px] font-medium leading-none ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="text-center text-xs text-gray-300 dark:text-gray-600 pb-2 mt-2">
        <p>DebtPet · Gamifying your journey to financial freedom</p>
      </div>

      {/* Add Debt Modal */}
      {showAddDebt && (
        <AddDebtForm
          onClose={() => setShowAddDebt(false)}
          isFirstDebt={debts.length === 0}
        />
      )}

      {/* Achievement Toast Notifications */}
      <AchievementToast />

      {/* Evolution Celebration Handler */}
      <EvolutionCelebration />
    </div>
  );
}

export default App;
