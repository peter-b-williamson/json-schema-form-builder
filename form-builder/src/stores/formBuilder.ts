import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { remapConditionReferences } from '@/fields/conditions';
import { createField, ensureUniqueKey, fieldPropertyKeys } from '@/fields/registry';
import { useUndoableFormHistory } from '@/composables/useUndoableFormHistory';
import type { FieldType, FieldUpdate, FormField } from '@/fields/types';

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const fields = ref<FormField[]>([]);
  const selectedId = ref<string | null>(null);
  const { commit, undo, redo, canUndo, canRedo } = useUndoableFormHistory(fields, selectedId);

  const selectedField = computed(
    () => fields.value.find((field) => field.id === selectedId.value) ?? null,
  );

  const addField = (type: FieldType) => {
    commit();

    const field = createField(type);
    field.key = ensureUniqueKey(field.key, new Set(fields.value.map((existing) => existing.key)));
    fields.value.push(field);
    selectedId.value = field.id;
  };

  const removeField = (id: string) => {
    const index = fields.value.findIndex((field) => field.id === id);
    if (index === -1) return;

    commit();

    const removedKey = fields.value[index]!.key;
    remapConditionReferences(fields.value, id, removedKey, '');

    fields.value.splice(index, 1);
    if (selectedId.value === id) {
      selectedId.value = null;
    }
  };

  const selectField = (id: string | null) => {
    selectedId.value = id;
  };

  const deselectField = () => {
    selectedId.value = null;
  };

  // Takes an ordered list of ids rather than the reordered field objects
  // themselves, so a malformed order (wrong length, unknown id) is caught
  // here instead of silently dropping or duplicating a field.
  const reorderFields = (order: string[]) => {
    const byId = new Map(fields.value.map((field) => [field.id, field]));
    const reordered = order
      .map((id) => byId.get(id))
      .filter((field): field is FormField => field !== undefined);

    if (reordered.length !== fields.value.length) {
      if (import.meta.env.DEV) {
        console.warn('reorderFields: order did not match the current fields, ignoring.');
      }
      return;
    }

    commit();
    fields.value = reordered;
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

    // Coalesced by field id, so a burst of edits to the same field (eg. every
    // keystroke in its title) becomes one undo step rather than one per keystroke.
    if (Object.keys(safeUpdates).length > 0) {
      commit(field.id);
    }

    if (typeof safeUpdates.key === 'string' && safeUpdates.key !== field.key) {
      remapConditionReferences(fields.value, field.id, field.key, safeUpdates.key);
    }

    Object.assign(field, safeUpdates);
  };

  return {
    fields,
    selectedId,
    selectedField,
    addField,
    deselectField,
    removeField,
    selectField,
    reorderFields,
    updateSelectedField,
    undo,
    redo,
    canUndo,
    canRedo,
  };
});
