import { computed } from 'vue';
import { defineStore } from 'pinia';
import vuetify, { THEME_STORAGE_KEY } from '@/plugins/vuetify';
import type { ThemeMode } from '@/types/theme';

export const useThemeStore = defineStore('theme', () => {
  const isDark = computed(() => vuetify.theme.global.current.value.dark);

  const toggle = () => {
    const next: ThemeMode = isDark.value ? 'light' : 'dark';
    vuetify.theme.change(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return { isDark, toggle };
});
