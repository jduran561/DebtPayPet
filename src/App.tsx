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
} from './components';
import { useDebtStore } from './store';
import { useAchievementChecker } from './hooks/useAchievementChecker';

type Tab = 'dashboard' | 'debts' | 'strategy' | 'achievements' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddDebt, setShowAddDebt] = useState(false);
  const { debts } = useDebtStore();

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐉</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">DebtPet</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pay off debt. Grow Penny.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setShowAddDebt(true)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <span>+</span>
                <span className="hidden sm:inline">Add Debt</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Reminder Banner - shows on all tabs */}
        <ReminderBanner />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
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

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        <p>DebtPet - Gamifying your journey to financial freedom</p>
      </footer>

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
