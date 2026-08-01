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

  <v-fab
    icon="mdi-download"
    color="primary"
    location="bottom end"
    app
    aria-label="Export schema"
    data-cy="export-schema-button"
    @click="isExportDialogOpen = true"
  />

  <ExportSchemaDialog v-model="isExportDialogOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ThemeToggle from '@/components/ThemeToggle.vue';
import ExportSchemaDialog from '@/components/ExportSchemaDialog.vue';

// State
const isExportDialogOpen = ref(false);
</script>

<style scoped>
:deep(.v-fab__container) {
  margin-right: 24px;
  margin-bottom: 24px;
}
</style>
