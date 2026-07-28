import { h } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { VApp } from 'vuetify/components';

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

import DefaultLayout from '@/layouts/DefaultLayout.vue';

describe('DefaultLayout', () => {
  const vuetify = createVuetify();

  // VAppBar/VMain are layout items that require a VApp ancestor to inject
  // into, so DefaultLayout is mounted the same way App.vue uses it.
  const mountDefaultLayout = () =>
    mount(
      { render: () => h(VApp, null, { default: () => h(DefaultLayout) }) },
      { global: { plugins: [vuetify] } },
    );

  beforeEach(() => {
    localStorage.clear();
    currentTheme.value = { dark: false };
    changeMock.mockClear();
    setActivePinia(createPinia());
  });

  it('renders the app title in the titlebar', () => {
    const wrapper = mountDefaultLayout();

    expect(wrapper.get('[data-cy=app-title]').text()).toBe('JSON Schema Form Builder');
  });

  it('toggles and persists the theme when the dark mode switch is used', async () => {
    const wrapper = mountDefaultLayout();

    const toggle = wrapper.find('input[type="checkbox"]');
    await toggle.setValue(true);

    expect(changeMock).toHaveBeenCalledWith('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
