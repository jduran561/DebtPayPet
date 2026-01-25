/**
 * ThemeToggle - Dark mode toggle button with sun/moon icons
 */

import { useThemeStore } from '../../store';

export function ThemeToggle() {
  const { mode, toggleMode, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  // Icon for current state
  const renderIcon = () => {
    if (mode === 'system') {
      // Computer/monitor icon for system mode
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (effectiveTheme === 'dark') {
      // Moon icon
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }

    // Sun icon
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-dark-surface-elevated transition-colors"
      title={`Theme: ${getModeLabel()} (click to toggle)`}
      aria-label={`Current theme: ${getModeLabel()}. Click to toggle.`}
    >
      {renderIcon()}
    </button>
  );
}
