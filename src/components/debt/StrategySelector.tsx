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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payoff Strategy</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Avalanche */}
        <button
          onClick={() => handleStrategyChange('avalanche')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            strategy.type === 'avalanche'
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <span className="font-semibold text-gray-800">Avalanche</span>
            {strategy.type === 'avalanche' && (
              <span className="ml-auto text-brand-primary text-sm">Active</span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Pay highest interest rate first. Saves the most money in interest.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Best for: Mathematically optimal savings
          </p>
        </button>

        {/* Snowball */}
        <button
          onClick={() => handleStrategyChange('snowball')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            strategy.type === 'snowball'
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❄️</span>
            <span className="font-semibold text-gray-800">Snowball</span>
            {strategy.type === 'snowball' && (
              <span className="ml-auto text-brand-primary text-sm">Active</span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Pay smallest balance first. Quick wins for motivation.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Best for: Building momentum with early victories
          </p>
        </button>
      </div>
    </div>
  );
}
