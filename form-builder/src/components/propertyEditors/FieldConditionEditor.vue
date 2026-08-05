<template>
  <div class="d-flex flex-column ga-2 mt-4">
    <div class="d-flex justify-space-between align-center">
      <span class="text-subtitle-2">Conditions</span>
      <v-btn
        text="Add condition"
        size="small"
        variant="text"
        prepend-icon="mdi-plus"
        data-cy="add-condition-button"
        rounded
        @click="addRule"
      />
    </div>

    <v-select
      :model-value="'and'"
      :items="[{ title: 'All of these (and)', value: 'and' }]"
      label="Match"
      density="compact"
      hide-details
      disabled
      data-cy="condition-operator-select"
    />

    <p
      v-if="rules.length === 0"
      class="text-caption text-medium-emphasis"
      data-cy="condition-empty"
    >
      This field is always shown.
    </p>

    <div
      v-for="{ rule, referenced } in decoratedRules"
      :key="rule.id"
      class="d-flex flex-column ga-2"
      :data-cy="`condition-row-${rule.id}`"
    >
      <div class="d-flex ga-2 align-center">
        <v-select
          :model-value="rule.field"
          :items="fieldOptions"
          item-title="title"
          item-value="key"
          label="Depends on field"
          density="compact"
          hide-details
          :data-cy="`condition-field-select-${rule.id}`"
          @update:model-value="(value: string) => updateRule(rule.id, { field: value, values: [] })"
        />
        <v-select
          :model-value="rule.type"
          :items="[{ title: 'Equals one of', value: 'equals' }]"
          label="Condition"
          density="compact"
          hide-details
          disabled
          :data-cy="`condition-type-select-${rule.id}`"
        />
        <v-btn
          icon="mdi-delete"
          density="compact"
          variant="text"
          aria-label="Remove condition"
          :data-cy="`remove-condition-button-${rule.id}`"
          @click="removeRule(rule.id)"
        />
      </div>

      <v-select
        v-if="referenced && isSelectionField(referenced)"
        :model-value="rule.values"
        :items="referenced.options"
        item-title="label"
        item-value="value"
        multiple
        chips
        label="Values"
        density="compact"
        hide-details
        :data-cy="`condition-values-select-${rule.id}`"
        @update:model-value="(value: string[]) => updateRule(rule.id, { values: value })"
      />
      <v-combobox
        v-else
        :model-value="rule.values"
        multiple
        chips
        label="Values"
        density="compact"
        hide-details
        :disabled="!referenced"
        :data-cy="`condition-values-combobox-${rule.id}`"
        @update:model-value="(value: string[]) => updateRule(rule.id, { values: value })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { isSelectionField } from '@/fields/guards';
import { useFormBuilderStore } from '@/stores/formBuilder';
import type { FieldCondition, FormField } from '@/fields/types';

// Props
const props = defineProps<{ field: FormField }>();

// Composables
const formStore = useFormBuilderStore();

// Computed
const otherFields = computed(() => formStore.fields.filter((field) => field.id !== props.field.id));
const fieldOptions = computed(() =>
  otherFields.value.map((field) => ({ title: field.title, key: field.key })),
);
const rules = computed(() => props.field.conditions?.rules ?? []);
const decoratedRules = computed(() =>
  rules.value.map((rule) => ({
    rule,
    referenced: otherFields.value.find((candidate) => candidate.key === rule.field) ?? null,
  })),
);

// Methods
const addRule = () => {
  const rule: FieldCondition = { id: crypto.randomUUID(), field: '', type: 'equals', values: [] };
  const current = props.field.conditions;
  formStore.updateSelectedField({
    conditions: { operator: current?.operator ?? 'and', rules: [...(current?.rules ?? []), rule] },
  });
};

const updateRule = (id: string, patch: Partial<Omit<FieldCondition, 'id'>>) => {
  const current = props.field.conditions;
  if (!current) return;

  formStore.updateSelectedField({
    conditions: {
      ...current,
      rules: current.rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    },
  });
};

const removeRule = (id: string) => {
  const current = props.field.conditions;
  if (!current) return;

  formStore.updateSelectedField({
    conditions: { ...current, rules: current.rules.filter((rule) => rule.id !== id) },
  });
};
</script>
