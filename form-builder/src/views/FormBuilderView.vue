<template>
  <MobileFormBuilder v-if="mdAndDown" />
  <ThreeColumnLayout v-else storage-key="form-builder-panel-sizes" class="fill-height">
    <template #left>
      <v-card class="pa-4" color="surfaceContainerLow">
        <h2 class="text-headline-medium mb-2 mt-0" data-cy="panel-heading-palette">
          Component Palette
        </h2>
        <v-divider opacity="1" role="presentation" class="mb-4" />
        <FieldPalette />
      </v-card>
    </template>
    <template #center>
      <v-card class="pa-4" color="surfaceContainerLow">
        <h2 class="text-headline-medium mb-2 mt-0" data-cy="panel-heading-form">Form</h2>
        <v-divider opacity="1" role="presentation" class="mb-4" />
        <v-tabs v-model="centerTab" density="compact" color="primary" class="mb-4">
          <v-tab value="fields" data-cy="center-tab-fields">Fields</v-tab>
          <v-tab value="preview" data-cy="center-tab-preview">Preview</v-tab>
        </v-tabs>
        <v-window v-model="centerTab">
          <v-window-item value="fields">
            <FieldList />
          </v-window-item>
          <v-window-item value="preview">
            <FormRenderer />
          </v-window-item>
        </v-window>
      </v-card>
    </template>
    <template #right>
      <v-card class="pa-4" color="surfaceContainerLow">
        <h2 class="text-headline-medium mb-2 mt-0" data-cy="panel-heading-properties">
          Properties
        </h2>
        <v-divider opacity="1" role="presentation" class="mb-4" />
        <FieldPropertiesEditor />
      </v-card>
    </template>
  </ThreeColumnLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

import ThreeColumnLayout from '@/components/ThreeColumnLayout.vue';
import MobileFormBuilder from '@/components/MobileFormBuilder.vue';
import FieldPalette from '@/components/FieldPalette.vue';
import FieldList from '@/components/FieldList.vue';
import FieldPropertiesEditor from '@/components/FieldPropertiesEditor.vue';
import FormRenderer from '@/components/FormRenderer.vue';

// Composables
const { mdAndDown } = useDisplay();

// State
const centerTab = ref<'fields' | 'preview'>('fields');
</script>

<style scoped>
.fill-height .v-card {
  height: 100%;
  overflow-y: auto;
}
</style>
