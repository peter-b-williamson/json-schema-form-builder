<template>
  <v-text-field
    v-model.number="min"
    label="Minimum"
    type="number"
    :error-messages="messagesFor('min')"
    data-cy="field-min-input"
  />
  <v-text-field
    v-model.number="max"
    label="Maximum"
    type="number"
    :error-messages="messagesFor('max')"
    data-cy="field-max-input"
  />
  <v-checkbox
    v-model="isFloat"
    label="Allow decimal values"
    hide-details
    data-cy="field-is-float-checkbox"
  />
</template>

<script setup lang="ts">
import { useFieldPropertyErrors } from '@/composables/useFieldPropertyErrors';
import { useFieldPropertyModel } from '@/composables/useFieldPropertyModel';
import { useFormBuilderStore } from '@/stores/formBuilder';
import type { NumberField } from '@/fields/types';

// Props
const props = defineProps<{ field: NumberField }>();

// Composables
const formStore = useFormBuilderStore();
const { messagesFor } = useFieldPropertyErrors(
  () => props.field,
  () => formStore.fields,
  () => formStore.touchedFieldIds.has(props.field.id),
);

// Computed
const min = useFieldPropertyModel(() => props.field, 'min', formStore.updateSelectedField);
const max = useFieldPropertyModel(() => props.field, 'max', formStore.updateSelectedField);
const isFloat = useFieldPropertyModel(() => props.field, 'isFloat', formStore.updateSelectedField);
</script>
