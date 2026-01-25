/**
 * Theme Store - Manages dark mode preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

// Check if system prefers dark mode
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',

      setMode: (mode: ThemeMode) => {
        set({ mode });
        const effectiveTheme = mode === 'system' ? getSystemTheme() : mode;
        applyTheme(effectiveTheme);
      },

      toggleMode: () => {
        const currentMode = get().mode;
        // Cycle through: light -> dark -> system -> light
        const nextMode: ThemeMode =
          currentMode === 'light' ? 'dark' :
          currentMode === 'dark' ? 'system' : 'light';
        get().setMode(nextMode);
      },

      getEffectiveTheme: () => {
        const mode = get().mode;
        return mode === 'system' ? getSystemTheme() : mode;
      },
    }),
    {
      name: 'debtpet-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on store rehydration
        if (state) {
          const effectiveTheme = state.mode === 'system' ? getSystemTheme() : state.mode;
          applyTheme(effectiveTheme);
        }
      },
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.mode === 'system') {
      applyTheme(getSystemTheme());
    }
  });

  // Apply initial theme
  const state = useThemeStore.getState();
  const effectiveTheme = state.mode === 'system' ? getSystemTheme() : state.mode;
  applyTheme(effectiveTheme);
}
