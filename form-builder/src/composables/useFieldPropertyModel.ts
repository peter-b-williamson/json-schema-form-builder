import { computed, type WritableComputedRef } from 'vue';

import type { FieldUpdate, FormField } from '@/fields/types';

// Binds a single property of a form field to a writable computed, so property-editor
// components can `v-model` directly against the store without hand-rolling a
// get/set pair per property.
export const useFieldPropertyModel = <T extends FormField, K extends keyof Omit<T, 'key' | 'type'>>(
  source: () => T,
  key: K,
  update: (patch: FieldUpdate) => void,
): WritableComputedRef<T[K]> =>
  computed({
    get: () => source()[key],
    // The cast is safe by construction: `key` and `value` both come from the same
    // field `T`, but TS can't verify a dynamically-keyed object literal against the
    // FieldUpdate union on its own.
    set: (value: T[K]) => update({ [key]: value } as FieldUpdate),
  });
