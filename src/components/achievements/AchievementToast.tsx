/**
 * AchievementToast - Popup notification when achievement is unlocked
 */

import { useEffect, useState } from 'react';
import { useAchievementStore } from '../../store/useAchievementStore';
import { usePetStore } from '../../store/usePetStore';
import { getAchievement } from '../../types/achievements';
import { useConfetti } from '../../hooks/useConfetti';

interface ToastData {
  id: string;
  achievementId: string;
  startTime: number;
}

const TOAST_DURATION = 4000; // 4 seconds

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { consumeNotification } = useAchievementStore();
  const { addXp } = usePetStore();
  const { triggerSmall, triggerGold } = useConfetti();

  // Poll for new notifications
  useEffect(() => {
    const checkForNotifications = () => {
      const achievementId = consumeNotification();
      if (achievementId) {
        const achievement = getAchievement(achievementId);
        if (achievement) {
          // Add XP reward
          addXp(achievement.xpReward, `Achievement unlocked: ${achievement.name}`);

          // Trigger confetti based on XP reward
          if (achievement.xpReward >= 500) {
            triggerGold();
          } else {
            triggerSmall();
          }

          // Add toast
          const newToast: ToastData = {
            id: `${achievementId}-${Date.now()}`,
            achievementId,
            startTime: Date.now(),
          };
          setToasts((prev) => [...prev, newToast]);
        }
      }
    };

    const interval = setInterval(checkForNotifications, 100);
    return () => clearInterval(interval);
  }, [consumeNotification, addXp, triggerSmall, triggerGold]);

  // Auto-remove toasts after duration
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) =>
        prev.filter((toast) => now - toast.startTime < TOAST_DURATION)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [toasts.length]);

  const handleDismiss = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast, index) => {
        const achievement = getAchievement(toast.achievementId);
        if (!achievement) return null;

        const elapsed = Date.now() - toast.startTime;
        const progress = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);

        return (
          <div
            key={toast.id}
            className="animate-slide-in-right"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl shadow-2xl p-4 min-w-[300px] max-w-[400px] overflow-hidden">
              {/* Progress bar */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl animate-bounce-subtle">
                    {achievement.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                      Achievement Unlocked!
                    </span>
                    <span className="text-yellow-200 text-xs font-bold">
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg leading-tight">
                    {achievement.name}
                  </h4>
                  <p className="text-white/80 text-sm mt-0.5">
                    {achievement.description}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => handleDismiss(toast.id)}
                  className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine pointer-events-none" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AchievementToast;
