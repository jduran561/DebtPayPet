/**
 * StrategySelector - Choose between Avalanche and Snowball payoff strategies
 */

import { useDebtStore } from '../../store';
import { usePetStore } from '../../store';
import { XP_REWARDS } from '../../types/pet';

export function StrategySelector() {
  const { strategy, setStrategy } = useDebtStore();
  const { addXp } = usePetStore();

  const handleStrategyChange = (type: 'avalanche' | 'snowball') => {
    if (strategy.type !== type) {
      setStrategy({ ...strategy, type });
      addXp(XP_REWARDS.STRATEGY_SELECTED, `Selected ${type} method`);
    }
  };

  const cards = [
    {
      type: 'avalanche' as const,
      emoji: '🔥',
      name: 'Avalanche',
      description: 'Pay highest interest rate first. Saves the most money in interest.',
      bestFor: 'Mathematically optimal savings',
    },
    {
      type: 'snowball' as const,
      emoji: '❄️',
      name: 'Snowball',
      description: 'Pay smallest balance first. Quick wins for motivation.',
      bestFor: 'Building momentum with early victories',
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payoff Strategy</h2>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const isActive = strategy.type === card.type;
          return (
            <button
              key={card.type}
              onClick={() => handleStrategyChange(card.type)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isActive
                  ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                  : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Emoji + Active badge row */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl leading-none">{card.emoji}</span>
                {isActive && (
                  <span className="text-[10px] font-semibold text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 px-2 py-0.5 rounded-full leading-none">
                    Active
                  </span>
                )}
              </div>

              {/* Name */}
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1.5">
                {card.name}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                {card.description}
              </p>

              {/* Best for */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-snug">
                <span className="font-medium">Best for:</span> {card.bestFor}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
