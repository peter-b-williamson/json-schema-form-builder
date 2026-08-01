<template>
  <Splitpanes class="three-column-layout" @resized="onResized">
    <Pane :size="sizes[0]" min-size="20">
      <slot name="left" />
    </Pane>
    <Pane :size="sizes[1]" min-size="30">
      <slot name="center" />
    </Pane>
    <Pane :size="sizes[2]" min-size="30">
      <slot name="right" />
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import type { SplitpanesResizedPayload } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import { useLocalStorage } from '@/composables/useLocalStorage';

type ThreeSizes = [number, number, number];

// Props
const props = withDefaults(
  defineProps<{
    storageKey: string;
    defaultSizes?: ThreeSizes;
  }>(),
  {
    defaultSizes: () => [20, 40, 40],
  },
);

// Composables
const sizes = useLocalStorage<ThreeSizes>(props.storageKey, props.defaultSizes);

// Methods
const onResized = (payload: SplitpanesResizedPayload) => {
  sizes.value = payload.panes.map((pane) => pane.size) as ThreeSizes;
};
</script>

<style scoped>
.three-column-layout {
  height: 100%;
}

.three-column-layout :deep(.splitpanes__pane) {
  overflow: auto;
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.three-column-layout :deep(.splitpanes__splitter) {
  width: 6px;
  background-color: rgb(var(--v-theme-surface-variant));
  transition: background-color 0.2s ease;
}

.three-column-layout :deep(.splitpanes__splitter:hover) {
  background-color: rgb(var(--v-theme-primary));
}
</style>
