<template>
  <v-number-input
    v-model="modelValue"
    :label="field.title"
    :min="min"
    :max="max"
    :precision="field.isFloat ? null : 0"
    :rules="rules"
    :data-cy="`preview-field-${field.id}`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { buildFieldRules } from '@/fields/validation';
import type { NumberField } from '@/fields/types';

// Props
const props = defineProps<{ field: NumberField }>();
const modelValue = defineModel<number | null>();

// Computed
const rules = computed(() => buildFieldRules(props.field));

const min = computed(() => (typeof props.field.min === 'number' ? props.field.min : undefined));

const max = computed(() => (typeof props.field.max === 'number' ? props.field.max : undefined));
</script>
