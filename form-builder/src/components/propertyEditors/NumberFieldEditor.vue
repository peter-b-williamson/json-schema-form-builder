<template>
  <v-text-field v-model.number="min" label="Minimum" type="number" data-cy="field-min-input" />
  <v-text-field v-model.number="max" label="Maximum" type="number" data-cy="field-max-input" />
  <v-checkbox
    v-model="isFloat"
    label="Allow decimal values"
    hide-details
    data-cy="field-is-float-checkbox"
  />
</template>

<script setup lang="ts">
import { useFieldPropertyModel } from '@/composables/useFieldPropertyModel';
import { useFormBuilderStore } from '@/stores/formBuilder';
import type { NumberField } from '@/fields/types';

// Props
const props = defineProps<{ field: NumberField }>();

// Composables
const formStore = useFormBuilderStore();

// Computed
const min = useFieldPropertyModel(() => props.field, 'min', formStore.updateSelectedField);
const max = useFieldPropertyModel(() => props.field, 'max', formStore.updateSelectedField);
const isFloat = useFieldPropertyModel(() => props.field, 'isFloat', formStore.updateSelectedField);
</script>
