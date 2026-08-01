import { ref } from 'vue';
import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useUndoableFormHistory } from '../useUndoableFormHistory';
import type { FormField } from '@/fields/types';

const textField = (): FormField => ({
  id: 'field-1',
  title: 'Text field',
  key: 'textField',
  type: 'text',
  required: false,
});

describe('useUndoableFormHistory', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('restores the fields and selection captured at the last commit', () => {
    const fields = ref<FormField[]>([textField()]);
    const selectedId = ref<string | null>('field-1');
    const { commit, undo } = useUndoableFormHistory(fields, selectedId);

    commit();
    fields.value[0]!.title = 'Renamed';
    selectedId.value = null;

    undo();

    expect(fields.value[0]!.title).toBe('Text field');
    expect(selectedId.value).toBe('field-1');
  });

  it('redo re-applies the state undo moved away from', () => {
    const fields = ref<FormField[]>([textField()]);
    const selectedId = ref<string | null>('field-1');
    const { commit, undo, redo } = useUndoableFormHistory(fields, selectedId);

    commit();
    fields.value[0]!.title = 'Renamed';

    undo();
    redo();

    expect(fields.value[0]!.title).toBe('Renamed');
  });

  it('snapshots are independent of later mutations to the live state', () => {
    const fields = ref<FormField[]>([textField()]);
    const selectedId = ref<string | null>(null);
    const { commit, undo } = useUndoableFormHistory(fields, selectedId);

    commit();
    fields.value[0]!.title = 'First edit';
    commit();
    fields.value[0]!.title = 'Second edit';

    undo();
    expect(fields.value[0]!.title).toBe('First edit');

    undo();
    expect(fields.value[0]!.title).toBe('Text field');
  });

  it('reflects canUndo/canRedo from the underlying history store', () => {
    const fields = ref<FormField[]>([]);
    const selectedId = ref<string | null>(null);
    const { commit, undo, canUndo, canRedo } = useUndoableFormHistory(fields, selectedId);

    expect(canUndo.value).toBe(false);

    commit();
    expect(canUndo.value).toBe(true);

    undo();
    expect(canUndo.value).toBe(false);
    expect(canRedo.value).toBe(true);
  });
});
