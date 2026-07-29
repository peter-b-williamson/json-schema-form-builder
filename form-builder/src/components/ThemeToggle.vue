<template>
  <v-tooltip :text="tooltipText" location="bottom">
    <template #activator="{ props: activatorProps }">
      <div v-bind="activatorProps" data-cy="theme-toggle" class="d-flex align-center">
        <v-switch
          :model-value="themeStore.isDark"
          prepend-icon="mdi-weather-sunny"
          append-icon="mdi-weather-night"
          density="compact"
          hide-details
          :aria-label="tooltipText"
          @update:model-value="themeStore.toggle"
        />
      </div>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useThemeStore } from '@/stores/theme';

// Composables
const themeStore = useThemeStore();

// Computed
const tooltipText = computed(() =>
  themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode',
);
</script>
