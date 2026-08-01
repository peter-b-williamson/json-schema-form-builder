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
        text="Add option"
        size="small"
        variant="text"
        prepend-icon="mdi-plus"
        data-cy="add-option-button"
        rounded
        @click="addOption"
      />
    </div>

    <VueDraggable
      v-model="options"
      tag="div"
      handle=".drag-handle"
      :animation="150"
      ghost-class="opacity-50"
      :force-fallback="true"
      :support-pointer="false"
    >
      <div
        v-for="(option, index) in options"
        :key="option.id"
        class="d-flex ga-2 align-center"
        :data-cy="`option-row-${option.id}`"
      >
        <div
          class="drag-handle d-flex align-center ga-1"
          style="cursor: grab"
          :data-cy="`option-drag-handle-${option.id}`"
        >
          <v-icon icon="mdi-drag-vertical" />
          <span class="text-caption text-medium-emphasis" :data-cy="`option-index-${option.id}`">
            {{ index + 1 }}
          </span>
        </div>
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
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

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
const options = useFieldPropertyModel(() => props.field, 'options', formStore.updateSelectedField);

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
  const updatedOptions = props.field.options.map((option) =>
    option.id === id ? { ...option, ...patch } : option,
  );
  formStore.updateSelectedField({ options: updatedOptions });
};

const removeOption = (id: string) => {
  formStore.updateSelectedField({
    options: props.field.options.filter((option) => option.id !== id),
  });
};
</script>
