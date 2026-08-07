import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useHistoryStore } from '@/stores/history';
import type { FormField } from '@/fields/types';

export const useUndoableFormHistory = (
  fields: Ref<FormField[]>,
  selectedId: Ref<string | null>,
) => {
  const history = useHistoryStore();
  const { canUndo, canRedo } = storeToRefs(history);

  // Vue's reactive Proxy wrapping trips up structuredClone (fails with a
  // DataCloneError), so fields are deep-cloned via a JSON round-trip instead.
  const snapshot = () => ({
    fields: JSON.parse(JSON.stringify(fields.value)) as FormField[],
    selectedId: selectedId.value,
  });

  const commit = (coalesceKey: string | null = null) => history.record(snapshot(), coalesceKey);

  const undo = () => {
    const previous = history.undo(snapshot());
    if (!previous) return;

    fields.value = previous.fields;
    selectedId.value = previous.selectedId;
  };

  const redo = () => {
    const next = history.redo(snapshot());
    if (!next) return;

    fields.value = next.fields;
    selectedId.value = next.selectedId;
  };

  return { commit, undo, redo, clear: history.clear, canUndo, canRedo };
};
