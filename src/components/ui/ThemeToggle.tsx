/**
 * ThemeToggle - Dropdown to choose Light, Dark, or System (device) theme
 */

import { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../../store';

type ThemeMode = 'light' | 'dark' | 'system';

const OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  const { mode, setMode, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current icon for the trigger button (matches effective theme for light/dark, or system icon)
  const triggerIcon = mode === 'system' ? OPTIONS[2].icon : effectiveTheme === 'dark' ? OPTIONS[1].icon : OPTIONS[0].icon;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleSelect = (value: ThemeMode) => {
    setMode(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-dark-surface-elevated transition-colors flex items-center gap-0.5"
        title="Theme"
        aria-label="Theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="theme-listbox"
        id="theme-trigger"
      >
        <span className="w-5 h-5 block [&>svg]:w-5 [&>svg]:h-5">{triggerIcon}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="theme-listbox"
          role="listbox"
          aria-labelledby="theme-trigger"
          className="absolute right-0 top-full mt-1 py-1 w-40 rounded-lg shadow-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface z-50 overflow-hidden"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={mode === opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface-elevated transition-colors"
            >
              <span className="text-gray-500 dark:text-gray-400">{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {mode === opt.value && (
                <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
