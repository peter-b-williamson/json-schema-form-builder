import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { createField, fieldPropertyKeys } from '@/fields/registry';
import type { FieldType, FieldUpdate, FormField } from '@/fields/types';

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const fields = ref<FormField[]>([]);
  const selectedKey = ref<string | null>(null);

  const selectedField = computed(
    () => fields.value.find((field) => field.key === selectedKey.value) ?? null,
  );

  const addField = (type: FieldType) => {
    const field = createField(type);
    fields.value.push(field);
    selectedKey.value = field.key;
  };

  const removeField = (key: string) => {
    const index = fields.value.findIndex((field) => field.key === key);
    if (index === -1) return;

    fields.value.splice(index, 1);
    if (selectedKey.value === key) {
      selectedKey.value = null;
    }
  };

  const selectField = (key: string | null) => {
    selectedKey.value = key;
  };

  const updateSelectedField = (updates: FieldUpdate) => {
    const field = selectedField.value;
    if (!field) return;

    const allowedKeys = fieldPropertyKeys[field.type];
    const safeUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.has(key)) {
        safeUpdates[key] = value;
      } else if (import.meta.env.DEV) {
        console.warn(
          `updateSelectedField: ignoring "${key}", not a property of a "${field.type}" field.`,
        );
      }
    }

    Object.assign(field, safeUpdates);
  };

  return {
    fields,
    selectedKey,
    selectedField,
    addField,
    removeField,
    selectField,
    updateSelectedField,
  };
});
