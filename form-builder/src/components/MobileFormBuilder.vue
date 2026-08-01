<template>
  <v-card
    class="fill-height d-flex flex-column"
    color="surfaceContainerLow"
    data-cy="mobile-form-builder"
  >
    <v-toolbar density="compact" color="surfaceContainerLow">
      <v-btn
        v-if="page === 1"
        icon="mdi-arrow-left"
        aria-label="Back to field list"
        data-cy="mobile-back-button"
        @click="onBackButtonClick"
      />

      <v-toolbar-title class="text-headline-medium" data-cy="mobile-page-title">
        {{ page === 1 ? (formStore.selectedField?.title ?? 'Field properties') : 'Form' }}
      </v-toolbar-title>

      <template #append>
        <v-menu v-if="page === 0" v-model="showPalette">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              icon="mdi-plus"
              aria-label="Add field"
              data-cy="mobile-add-field-button"
            />
          </template>
          <v-card min-width="220">
            <FieldPalette />
          </v-card>
        </v-menu>
      </template>
    </v-toolbar>

    <v-window v-model="page" class="flex-grow-1 overflow-y-auto">
      <v-window-item :value="0" class="pa-4">
        <v-tabs v-model="formTab" density="compact" color="primary" class="mb-4">
          <v-tab value="fields" data-cy="mobile-tab-fields">Fields</v-tab>
          <v-tab value="preview" data-cy="mobile-tab-preview">Preview</v-tab>
        </v-tabs>
        <v-window v-model="formTab">
          <v-window-item value="fields">
            <FieldList />
          </v-window-item>
          <v-window-item value="preview">
            <FormRenderer :select-on-focus="false" />
          </v-window-item>
        </v-window>
      </v-window-item>
      <v-window-item :value="1" class="pa-4">
        <FieldPropertiesEditor />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { useFormBuilderStore } from '@/stores/formBuilder';
import FieldPalette from '@/components/FieldPalette.vue';
import FieldList from '@/components/FieldList.vue';
import FieldPropertiesEditor from '@/components/FieldPropertiesEditor.vue';
import FormRenderer from '@/components/FormRenderer.vue';

// Composables
const formStore = useFormBuilderStore();

// State
const page = ref(0);
const showPalette = ref(false);
const formTab = ref<'fields' | 'preview'>('fields');

// Methods
const onBackButtonClick = () => {
  page.value = 0;
  formStore.deselectField();
};

// Selecting a field - whether by adding one or tapping an existing row - should jump
// straight to its properties, mirroring the desktop layout where both panels are
// always visible side by side.
watch(
  () => formStore.selectedId,
  (id) => {
    if (!id) return;
    page.value = 1;
    showPalette.value = false;
  },
);
</script>
