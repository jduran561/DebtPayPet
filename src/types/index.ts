/**
 * Central export for all TypeScript types
 */

export * from './debt';
export * from './pet';
export * from './notifications';

// App-wide types
export interface User {
  id: string;
  displayName: string;
  createdAt: Date;
  settings: UserSettings;
  streak: StreakInfo;
}

export interface UserSettings {
  currency: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
}

export interface StreakInfo {
  currentStreak: number; // Days in a row with activity
  longestStreak: number;
  lastActivityDate: Date | null;
}

// For localStorage persistence
export interface PersistedState {
  debts: import('./debt').Debt[];
  payments: import('./debt').Payment[];
  pet: import('./pet').Pet;
  user: User;
  version: number; // For migration handling
}
