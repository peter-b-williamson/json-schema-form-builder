<template>
  <v-text-field v-model="placeholder" label="Placeholder" data-cy="field-placeholder-input" />
  <v-text-field
    v-model.number="minLength"
    label="Minimum length"
    type="number"
    data-cy="field-min-length-input"
  />
  <v-text-field
    v-model.number="maxLength"
    label="Maximum length"
    type="number"
    data-cy="field-max-length-input"
  />
</template>

<script setup lang="ts">
import { useFieldPropertyModel } from '@/composables/useFieldPropertyModel';
import { useFormBuilderStore } from '@/stores/formBuilder';
import type { TextField } from '@/fields/types';

// Props
const props = defineProps<{ field: TextField }>();

// Composables
const formStore = useFormBuilderStore();

// Computed
const placeholder = useFieldPropertyModel(
  () => props.field,
  'placeholder',
  formStore.updateSelectedField,
);
const minLength = useFieldPropertyModel(
  () => props.field,
  'minLength',
  formStore.updateSelectedField,
);
const maxLength = useFieldPropertyModel(
  () => props.field,
  'maxLength',
  formStore.updateSelectedField,
);
</script>
