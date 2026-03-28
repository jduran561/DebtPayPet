/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';

// Provide a simple localStorage mock for tests (jsdom may not wire it in all environments)
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
}

beforeEach(() => localStorage.clear());
