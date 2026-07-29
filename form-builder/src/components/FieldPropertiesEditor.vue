<template>
  <div v-if="selectedField" class="d-flex flex-column ga-4" data-cy="field-properties-editor">
    <v-text-field v-model="title" label="Title" data-cy="field-title-input" color="primary" />
    <v-checkbox
      v-model="required"
      label="Required"
      hide-details
      data-cy="field-required-checkbox"
    />

    <TextFieldEditor v-if="isTextField(selectedField)" :field="selectedField" />
    <NumberFieldEditor v-else-if="isNumberField(selectedField)" :field="selectedField" />
    <SelectionFieldEditor v-else-if="isSelectionField(selectedField)" :field="selectedField" />
  </div>

  <p
    v-else
    class="font-italic font-weight-light bg-surfaceContainerLow"
    data-cy="field-properties-empty"
  >
    Select a field to edit its properties.
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useFieldPropertyModel } from '@/composables/useFieldPropertyModel';
import { isNumberField, isSelectionField, isTextField } from '@/fields/guards';
import { useFormBuilderStore } from '@/stores/formBuilder';

import NumberFieldEditor from '@/components/propertyEditors/NumberFieldEditor.vue';
import SelectionFieldEditor from '@/components/propertyEditors/SelectionFieldEditor.vue';
import TextFieldEditor from '@/components/propertyEditors/TextFieldEditor.vue';

// Composables
const formStore = useFormBuilderStore();

// Computed
const selectedField = computed(() => formStore.selectedField);
const title = useFieldPropertyModel(
  () => selectedField.value!,
  'title',
  formStore.updateSelectedField,
);
const required = useFieldPropertyModel(
  () => selectedField.value!,
  'required',
  formStore.updateSelectedField,
);
</script>
