<template>
  <v-app-bar>
    <v-toolbar-title data-cy="app-title">
      <h1 class="text-title-large">JSON Schema Form Builder</h1>
    </v-toolbar-title>
    <template #append>
      <ThemeToggle />
    </template>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>

  <div class="floating-actions left">
    <v-btn
      icon="mdi-undo"
      :disabled="!formStore.canUndo"
      aria-label="Undo"
      color="primary"
      data-cy="undo-button"
      @click="formStore.undo()"
    />
    <v-btn
      icon="mdi-redo"
      :disabled="!formStore.canRedo"
      aria-label="Redo"
      color="primary"
      data-cy="redo-button"
      @click="formStore.redo()"
    />
  </div>

  <div class="floating-actions right">
    <v-btn
      icon="mdi-download"
      color="primary"
      aria-label="Export schema"
      data-cy="export-schema-button"
      @click="isExportDialogOpen = true"
    />
  </div>

  <ExportSchemaDialog v-model="isExportDialogOpen" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import ThemeToggle from '@/components/ThemeToggle.vue';
import ExportSchemaDialog from '@/components/ExportSchemaDialog.vue';
import { useFormBuilderStore } from '@/stores/formBuilder';

// Composables
const formStore = useFormBuilderStore();

// State
const isExportDialogOpen = ref(false);

// Methods
const handleKeydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  const isUndo = event.ctrlKey && !event.shiftKey && key === 'z';
  const isRedo = event.ctrlKey && (key === 'y' || (event.shiftKey && key === 'z'));

  if (isUndo) {
    event.preventDefault();
    formStore.undo();
  } else if (isRedo) {
    event.preventDefault();
    formStore.redo();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.floating-actions {
  position: fixed;
  display: flex;
  background-color: rgb(var(--v-theme-surfaceContainerHigh));
  border-radius: 50px;
  padding: 8px;
  gap: 16px;
  bottom: 24px;
}

.floating-actions.left {
  left: 24px;
}

.floating-actions.right {
  right: 24px;
}
</style>
