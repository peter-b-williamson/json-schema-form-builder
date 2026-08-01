<template>
  <v-text-field
    v-model="modelValue"
    :label="field.title"
    :placeholder="field.placeholder"
    :rules="rules"
    :data-cy="`preview-field-${field.id}`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { buildFieldRules } from '@/fields/validation';
import type { TextField } from '@/fields/types';

// Props
const props = defineProps<{ field: TextField }>();
const modelValue = defineModel<string>();

// Computed
const rules = computed(() => buildFieldRules(props.field));
</script>
