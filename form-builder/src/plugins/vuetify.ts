import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import { createVuetify } from 'vuetify';
import type { ThemeMode } from '@/types/theme';

export const THEME_STORAGE_KEY = 'theme';

const getInitialTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: getInitialTheme(),
  },
});

export default vuetify;
