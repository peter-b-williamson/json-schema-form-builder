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

const variables = {
  'high-emphasis-opacity': 0.95,
  'medium-emphasis-opacity': 0.8,
  'focus-opacity': 0.08,
};

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
  },
  defaults: {
    VTextField: { color: 'primary' },
    VSelect: { color: 'primary' },
    VCheckbox: { color: 'primary' },
    VSwitch: { color: 'primary' },
    VNumberInput: { color: 'primary' },
  },
  theme: {
    defaultTheme: getInitialTheme(),
    themes: {
      // Generated using https://material-foundation.github.io/material-theme-builder/
      light: {
        variables,
        colors: {
          primary: '#004747',
          'on-primary': '#FFFFFF',
          secondary: '#0C3C3D',
          'on-secondary': '#FFFFFF',
          tertiary: '#422A61',
          'on-tertiary': '#FFFFFF',
          error: '#CF2C27',
          'on-error': '#FFFFFF',
          background: '#F5FAFA',
          'on-background': '#171D1D',
          surface: '#F5FAFA',
          'on-surface': '#0C1212',
          surfaceVariant: '#D7E5E4',
          'on-surfaceVariant': '#2C3838',
          outline: '#485555',
          outlineVariant: '#62706F',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#2B3231',
          'on-inverseSurface': '#ECF2F1',
          surfaceDim: '#C2C8C7',
          surfaceBright: '#F5FAFA',
          surfaceContainerLowest: '#FFFFFF',
          surfaceContainerLow: '#EFF5F4',
          surfaceContainer: '#E3E9E8',
          surfaceContainerHigh: '#D8DEDD',
          surfaceContainerHighest: '#CDD3D2',
        },
      },
      dark: {
        dark: true,
        variables,
        colors: {
          primary: '#5BDCDC',
          'on-primary': '#003F40',
          secondary: '#B8E5E4',
          'on-secondary': '#002B2B',
          tertiary: '#EFDFFF',
          'on-tertiary': '#372056',
          error: '#FF5449',
          'on-error': '#000000',
          background: '#0E1414',
          'on-background': '#DEE4E3',
          surface: '#0E1414',
          'on-surface': '#FFFFFF',
          surfaceVariant: '#3C4949',
          'on-surfaceVariant': '#D1DFDE',
          outline: '#A7B5B4',
          outlineVariant: '#859392',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#DEE4E3',
          'on-inverseSurface': '#252B2B',
          surfaceDim: '#0E1414',
          surfaceBright: '#3F4645',
          surfaceContainerLowest: '#040808',
          surfaceContainerLow: '#191F1F',
          surfaceContainer: '#232929',
          surfaceContainerHigh: '#2E3433',
          surfaceContainerHighest: '#393F3F',
        },
      },
    },
  },
});

export default vuetify;
