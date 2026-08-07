<template>
  <v-dialog v-model="isConfirmOpen" max-width="480" data-cy="import-confirm-dialog">
    <v-card color="surfaceContainer" class="pa-4">
      <h3 class="text-headline-small mb-2 mt-0" data-cy="import-confirm-heading">
        Replace current form?
      </h3>
      <p class="mb-4">
        Importing a schema will replace all fields in the current form. This can't be undone.
      </p>
      <v-card-actions class="mx-n2">
        <v-spacer />
        <v-btn
          text="Cancel"
          variant="flat"
          color="error"
          class="mr-2"
          prepend-icon="mdi-close"
          data-cy="import-confirm-cancel-button"
          @click="isConfirmOpen = false"
        />
        <v-btn
          text="Continue"
          color="primary"
          variant="flat"
          prepend-icon="mdi-upload"
          data-cy="import-confirm-proceed-button"
          @click="onConfirmProceed"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isReportOpen" max-width="480" data-cy="import-report-dialog">
    <v-card color="surfaceContainer" class="pa-4">
      <h3 class="text-headline-small mb-2 mt-0" data-cy="import-report-heading">
        {{ report?.kind === 'error' ? 'Import failed' : 'Import complete' }}
      </h3>
      <v-alert
        v-if="report?.kind === 'error'"
        type="error"
        density="compact"
        variant="tonal"
        class="mb-2"
        data-cy="import-report-error"
      >
        {{ report.message }}
      </v-alert>
      <template v-else-if="report">
        <p class="mb-2" data-cy="import-report-summary">
          Imported {{ report.fieldCount }} field{{ report.fieldCount === 1 ? '' : 's' }}.
        </p>
        <template v-if="report.ignored.length > 0">
          <p class="text-body-2 mb-1">The following wasn't supported and was skipped:</p>
          <v-list density="compact" class="mb-2">
            <v-list-item
              v-for="(item, index) in report.ignored"
              :key="index"
              :title="item"
              data-cy="import-report-ignored-item"
            />
          </v-list>
        </template>
      </template>
      <v-card-actions class="mx-n2">
        <v-spacer />
        <v-btn
          text="Close"
          color="primary"
          variant="flat"
          data-cy="import-report-close-button"
          @click="isReportOpen = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <input
    ref="fileInputRef"
    type="file"
    accept="application/json,.json"
    class="d-none"
    data-cy="import-file-input"
    @change="onFileSelected"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { parseJsonSchema, SchemaImportError } from '@/fields/schema';
import { useFormBuilderStore } from '@/stores/formBuilder';

type ImportReport =
  { kind: 'error'; message: string } | { kind: 'success'; fieldCount: number; ignored: string[] };

// Composables
const formStore = useFormBuilderStore();

// State
const isConfirmOpen = ref(false);
const isReportOpen = ref(false);
const report = ref<ImportReport | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Methods
const triggerFilePicker = () => {
  // Reset first so re-selecting the same file still fires "change".
  if (fileInputRef.value) fileInputRef.value.value = '';
  fileInputRef.value?.click();
};

// Entry point, called from the FAB. Warns about data loss first if there's anything to lose.
const open = () => {
  if (formStore.fields.length > 0) {
    isConfirmOpen.value = true;
    return;
  }
  triggerFilePicker();
};

const onConfirmProceed = () => {
  isConfirmOpen.value = false;
  triggerFilePicker();
};

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    report.value = { kind: 'error', message: 'That file is not valid JSON.' };
    isReportOpen.value = true;
    return;
  }

  try {
    const result = parseJsonSchema(parsed);
    formStore.loadFromSchema(result.fields);
    report.value = { kind: 'success', fieldCount: result.fields.length, ignored: result.ignored };
  } catch (error) {
    const message =
      error instanceof SchemaImportError ? error.message : 'That file could not be imported.';
    report.value = { kind: 'error', message };
  }

  isReportOpen.value = true;
};

defineExpose({ open });
</script>
