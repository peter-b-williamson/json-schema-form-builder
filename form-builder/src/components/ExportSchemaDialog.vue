<template>
  <v-dialog v-model="isOpen" max-width="480" data-cy="export-schema-dialog">
    <v-card color="surfaceContainer" class="pa-4">
      <h3 class="text-headline-small mb-2 mt-0" data-cy="export-dialog-heading">Export Schema</h3>
      <v-text-field
        v-model="filename"
        label="File name"
        suffix=".schema.json"
        autofocus
        data-cy="export-filename-input"
        @keyup.enter="onDownloadClick"
      />
      <v-card-actions class="mx-n2">
        <v-spacer />
        <v-btn
          text="Cancel"
          variant="flat"
          color="error"
          class="mr-2"
          prepend-icon="mdi-close"
          data-cy="export-cancel-button"
          @click="onCancelClick"
        />
        <v-btn
          text="Download"
          color="primary"
          variant="flat"
          prepend-icon="mdi-download"
          data-cy="export-download-button"
          @click="onDownloadClick"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { generateJsonSchema } from '@/fields/schema';
import { useFormBuilderStore } from '@/stores/formBuilder';

const SCHEMA_FILE_SUFFIX = '.schema.json';
const DEFAULT_FILENAME = 'schema';

// Props
const isOpen = defineModel<boolean>({ required: true });

// Composables
const formStore = useFormBuilderStore();

// State
const filename = ref(DEFAULT_FILENAME);

// Resets the filename each time the dialog opens, rather than leaving the
// previous export's name behind for the next one.
watch(isOpen, (open) => {
  if (open) filename.value = DEFAULT_FILENAME;
});

// Methods
const onCancelClick = () => {
  isOpen.value = false;
};

const onDownloadClick = () => {
  const trimmed = filename.value.trim() || DEFAULT_FILENAME;
  const resolvedFilename = trimmed.endsWith(SCHEMA_FILE_SUFFIX)
    ? trimmed
    : `${trimmed}${SCHEMA_FILE_SUFFIX}`;

  const schema = generateJsonSchema(formStore.fields);
  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = resolvedFilename;
  anchor.click();

  URL.revokeObjectURL(url);
  isOpen.value = false;
};
</script>
