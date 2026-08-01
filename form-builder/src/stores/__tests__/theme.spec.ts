import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const { currentTheme, changeMock } = vi.hoisted(() => {
  const currentTheme = { value: { dark: false } };
  const changeMock = vi.fn((mode: 'light' | 'dark') => {
    currentTheme.value = { dark: mode === 'dark' };
  });

  return { currentTheme, changeMock };
});

vi.mock('@/plugins/vuetify', () => ({
  default: {
    theme: {
      global: { current: currentTheme },
      change: changeMock,
    },
  },
  THEME_STORAGE_KEY: 'theme',
}));

import { useThemeStore } from '../theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    currentTheme.value = { dark: false };
    changeMock.mockClear();
    setActivePinia(createPinia());
  });

  it('reflects a light vuetify theme', () => {
    const store = useThemeStore();

    expect(store.isDark).toBe(false);
  });

  it('reflects a dark vuetify theme', () => {
    currentTheme.value = { dark: true };
    const store = useThemeStore();

    expect(store.isDark).toBe(true);
  });

  it('switches from light to dark and persists the choice', () => {
    const store = useThemeStore();

    store.toggle();

    expect(changeMock).toHaveBeenCalledWith('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('switches from dark back to light and persists the choice', () => {
    currentTheme.value = { dark: true };
    const store = useThemeStore();

    store.toggle();

    expect(changeMock).toHaveBeenCalledWith('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
