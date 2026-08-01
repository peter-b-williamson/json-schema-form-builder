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
          primary: '#003D3D',
          surfaceTint: '#006A6A',
          onPrimary: '#FFFFFF',
          primaryContainer: '#007A7A',
          onPrimaryContainer: '#FFFFFF',
          secondary: '#0C3C3D',
          onSecondary: '#FFFFFF',
          secondaryContainer: '#497474',
          onSecondaryContainer: '#FFFFFF',
          tertiary: '#422A61',
          onTertiary: '#FFFFFF',
          tertiaryContainer: '#7B629D',
          onTertiaryContainer: '#FFFFFF',
          error: '#740006',
          onError: '#FFFFFF',
          errorContainer: '#CF2C27',
          onErrorContainer: '#FFFFFF',
          background: '#F5FAFA',
          onBackground: '#171D1D',
          surface: '#F5FAFA',
          onSurface: '#0C1212',
          surfaceVariant: '#D7E5E4',
          onSurfaceVariant: '#2C3838',
          outline: '#485555',
          outlineVariant: '#62706F',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#2B3231',
          inverseOnSurface: '#ECF2F1',
          inversePrimary: '#57D9D9',
          primaryFixed: '#007A7A',
          onPrimaryFixed: '#FFFFFF',
          primaryFixedDim: '#005F5F',
          onPrimaryFixedVariant: '#FFFFFF',
          secondaryFixed: '#497474',
          onSecondaryFixed: '#FFFFFF',
          secondaryFixedDim: '#315C5C',
          onSecondaryFixedVariant: '#FFFFFF',
          tertiaryFixed: '#7B629D',
          onTertiaryFixed: '#FFFFFF',
          tertiaryFixedDim: '#614983',
          onTertiaryFixedVariant: '#FFFFFF',
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
          primary: '#7BF9F9',
          surfaceTint: '#57D9D9',
          onPrimary: '#003232',
          primaryContainer: '#5BDCDC',
          onPrimaryContainer: '#003F40',
          secondary: '#B8E5E4',
          onSecondary: '#002B2B',
          secondaryContainer: '#6D9898',
          onSecondaryContainer: '#000000',
          tertiary: '#EFDFFF',
          onTertiary: '#372056',
          tertiaryContainer: '#DABDFF',
          onTertiaryContainer: '#442C64',
          error: '#FFD2CC',
          onError: '#540003',
          errorContainer: '#FF5449',
          onErrorContainer: '#000000',
          background: '#0E1414',
          onBackground: '#DEE4E3',
          surface: '#0E1414',
          onSurface: '#FFFFFF',
          surfaceVariant: '#3C4949',
          onSurfaceVariant: '#D1DFDE',
          outline: '#A7B5B4',
          outlineVariant: '#859392',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#DEE4E3',
          inverseOnSurface: '#252B2B',
          inversePrimary: '#005151',
          primaryFixed: '#78F6F6',
          onPrimaryFixed: '#001414',
          primaryFixedDim: '#57D9D9',
          onPrimaryFixedVariant: '#003D3D',
          secondaryFixed: '#BEEBEA',
          onSecondaryFixed: '#001414',
          secondaryFixedDim: '#A2CFCE',
          onSecondaryFixedVariant: '#0C3C3D',
          tertiaryFixed: '#EDDCFF',
          onTertiaryFixed: '#1B013A',
          tertiaryFixedDim: '#D7BAFC',
          onTertiaryFixedVariant: '#422A61',
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
