<template>
  <v-checkbox
    v-model="multiple"
    label="Allow multiple selection"
    hide-details
    data-cy="field-multiple-checkbox"
  />

  <div class="d-flex flex-column ga-2 mt-4">
    <div class="d-flex justify-space-between align-center">
      <span class="text-subtitle-2">Options</span>
      <v-btn
        size="small"
        variant="text"
        prepend-icon="mdi-plus"
        data-cy="add-option-button"
        rounded
        @click="addOption"
      >
        Add option
      </v-btn>
    </div>

    <div
      v-for="option in field.options"
      :key="option.id"
      class="d-flex ga-2 align-center"
      :data-cy="`option-row-${option.id}`"
    >
      <v-text-field
        :model-value="option.label"
        label="Label"
        density="compact"
        hide-details
        :data-cy="`option-label-input-${option.id}`"
        @update:model-value="(value) => updateOption(option.id, { label: value })"
      />
      <v-text-field
        :model-value="option.value"
        label="Value"
        density="compact"
        hide-details
        :data-cy="`option-value-input-${option.id}`"
        @update:model-value="(value) => updateOption(option.id, { value })"
      />
      <v-btn
        icon="mdi-delete"
        density="compact"
        variant="text"
        :aria-label="`Remove option ${option.label}`"
        :data-cy="`remove-option-button-${option.id}`"
        @click="removeOption(option.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useFieldPropertyModel } from '@/composables/useFieldPropertyModel';
import { useFormBuilderStore } from '@/stores/formBuilder';
import type { SelectionField, SelectOption } from '@/fields/types';

// Props
const props = defineProps<{ field: SelectionField }>();

// Composables
const formStore = useFormBuilderStore();

// Computed
const multiple = useFieldPropertyModel(
  () => props.field,
  'multiple',
  formStore.updateSelectedField,
);

// State
const nextOptionNumber = ref(props.field.options.length + 1);

// Methods
const addOption = () => {
  const option: SelectOption = {
    id: crypto.randomUUID(),
    label: `Option ${nextOptionNumber.value}`,
    value: `option_${nextOptionNumber.value}`,
  };
  nextOptionNumber.value += 1;
  formStore.updateSelectedField({ options: [...props.field.options, option] });
};

const updateOption = (id: string, patch: Partial<Omit<SelectOption, 'id'>>) => {
  const options = props.field.options.map((option) =>
    option.id === id ? { ...option, ...patch } : option,
  );
  formStore.updateSelectedField({ options });
};

const removeOption = (id: string) => {
  formStore.updateSelectedField({
    options: props.field.options.filter((option) => option.id !== id),
  });
};
</script>
