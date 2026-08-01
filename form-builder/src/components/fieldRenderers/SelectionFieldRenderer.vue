<template>
  <v-select
    v-model="resolvedModelValue"
    :items="field.options"
    item-title="label"
    item-value="value"
    :label="field.title"
    :multiple="field.multiple"
    :rules="rules"
    :data-cy="`preview-field-${field.id}`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { buildFieldRules } from '@/fields/validation';
import type { SelectionField } from '@/fields/types';

// Props
const props = defineProps<{ field: SelectionField }>();
const modelValue = defineModel<string | string[]>();

// Computed
const rules = computed(() => buildFieldRules(props.field));

// v-select's `multiple` prop expects an array model even before anything is
// selected - falls back per field.multiple rather than via defineModel's
// `default`, since that macro can't reference locally declared props.
const resolvedModelValue = computed({
  get: () => modelValue.value ?? (props.field.multiple ? [] : undefined),
  set: (value) => {
    modelValue.value = value;
  },
});
</script>
