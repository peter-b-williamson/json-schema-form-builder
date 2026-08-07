import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import type { FormField } from '@/fields/types';

export interface FormSnapshot {
  fields: FormField[];
  selectedId: string | null;
}

// A record() call passing the same coalesceKey as the previous one, within this
// window, is folded into the existing top-of-stack entry instead of pushing a new
// one - keeps a burst of keystroke-driven edits to one field as a single undo step.
const COALESCE_WINDOW_MS = 500;

export const useHistoryStore = defineStore('history', () => {
  const past = ref<FormSnapshot[]>([]);
  const future = ref<FormSnapshot[]>([]);
  const coalesceKey = ref<string | null>(null);
  const coalesceUntil = ref(0);

  const canUndo = computed(() => past.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  const record = (snapshot: FormSnapshot, coalesceKey_: string | null = null) => {
    const now = Date.now();
    const coalesced =
      coalesceKey_ !== null && coalesceKey_ === coalesceKey.value && now < coalesceUntil.value;

    if (!coalesced) {
      past.value.push(snapshot);
      future.value = [];
    }
    coalesceKey.value = coalesceKey_;
    coalesceUntil.value = now + COALESCE_WINDOW_MS;
  };

  const undo = (current: FormSnapshot): FormSnapshot | undefined => {
    const previous = past.value.pop();
    if (!previous) return undefined;

    future.value.push(current);
    coalesceKey.value = null;
    return previous;
  };

  const redo = (current: FormSnapshot): FormSnapshot | undefined => {
    const next = future.value.pop();
    if (!next) return undefined;

    past.value.push(current);
    coalesceKey.value = null;
    return next;
  };

  const clear = () => {
    past.value = [];
    future.value = [];
    coalesceKey.value = null;
    coalesceUntil.value = 0;
  };

  return { past, future, canUndo, canRedo, record, undo, redo, clear };
});
