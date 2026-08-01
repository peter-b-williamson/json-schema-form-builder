import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useHistoryStore, type FormSnapshot } from '../history';

const snapshot = (selectedId: string | null = null): FormSnapshot => ({ fields: [], selectedId });

describe('useHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with nothing to undo or redo', () => {
    const store = useHistoryStore();

    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
  });

  it('makes undo available once a snapshot is recorded', () => {
    const store = useHistoryStore();

    store.record(snapshot());

    expect(store.canUndo).toBe(true);
  });

  it('undo returns the previously recorded snapshot and pushes the current one onto redo', () => {
    const store = useHistoryStore();
    const recorded = snapshot('a');
    const current = snapshot('b');

    store.record(recorded);

    expect(store.undo(current)).toEqual(recorded);
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(true);
    expect(store.redo(recorded)).toEqual(current);
  });

  it('undo does nothing and returns undefined when there is nothing to undo', () => {
    const store = useHistoryStore();

    expect(store.undo(snapshot())).toBeUndefined();
    expect(store.canRedo).toBe(false);
  });

  it('redo does nothing and returns undefined when there is nothing to redo', () => {
    const store = useHistoryStore();

    expect(store.redo(snapshot())).toBeUndefined();
    expect(store.canUndo).toBe(false);
  });

  it('recording a new snapshot clears the redo stack', () => {
    const store = useHistoryStore();

    store.record(snapshot('a'));
    store.undo(snapshot('b'));
    expect(store.canRedo).toBe(true);

    store.record(snapshot('c'));

    expect(store.canRedo).toBe(false);
  });

  describe('coalescing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('folds a same-key record within the coalesce window into the existing entry', () => {
      const store = useHistoryStore();

      store.record(snapshot('a'), 'field-1');
      store.record(snapshot('b'), 'field-1');

      expect(store.past).toHaveLength(1);
      expect(store.undo(snapshot('c'))).toEqual(snapshot('a'));
    });

    it('starts a new entry once the coalesce window has passed', () => {
      const store = useHistoryStore();

      store.record(snapshot('a'), 'field-1');
      vi.advanceTimersByTime(1000);
      store.record(snapshot('b'), 'field-1');

      expect(store.past).toHaveLength(2);
    });

    it('does not coalesce records with different keys', () => {
      const store = useHistoryStore();

      store.record(snapshot('a'), 'field-1');
      store.record(snapshot('b'), 'field-2');

      expect(store.past).toHaveLength(2);
    });

    it('does not coalesce when no key is given', () => {
      const store = useHistoryStore();

      store.record(snapshot('a'));
      store.record(snapshot('b'));

      expect(store.past).toHaveLength(2);
    });

    it('does not resume coalescing into an entry recorded before an undo', () => {
      const store = useHistoryStore();

      store.record(snapshot('a'), 'field-1');
      store.undo(snapshot('b'));
      store.record(snapshot('c'), 'field-1');

      expect(store.past).toHaveLength(1);
    });
  });
});
