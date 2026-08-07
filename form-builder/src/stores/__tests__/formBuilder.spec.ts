import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useFormBuilderStore } from '../formBuilder';
import type { SelectionField } from '@/fields/types';

describe('useFormBuilderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with no fields and nothing selected', () => {
    const store = useFormBuilderStore();

    expect(store.fields).toEqual([]);
    expect(store.selectedField).toBeNull();
  });

  it('adds a field and automatically selects it', () => {
    const store = useFormBuilderStore();

    store.addField('text');

    expect(store.fields).toHaveLength(1);
    expect(store.selectedField).toBe(store.fields[0]);
  });

  it('gives fields of the same type distinct default keys', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('text');

    expect(store.fields[0]?.key).not.toBe(store.fields[1]?.key);
  });

  it('selecting a later field replaces the current selection', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');

    expect(store.selectedField?.id).toBe(store.fields[1]?.id);

    store.selectField(store.fields[0]?.id ?? null);

    expect(store.selectedField?.id).toBe(store.fields[0]?.id);
  });

  it('clears the selection when deselected', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.deselectField();

    expect(store.selectedField).toBeNull();
  });

  it('removes a field by id without disturbing the others', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first, second] = store.fields;

    store.removeField(first!.id);

    expect(store.fields).toHaveLength(1);
    expect(store.fields[0]?.id).toBe(second!.id);
  });

  it('clears the selection when the selected field is removed', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    const id = store.fields[0]!.id;

    store.removeField(id);

    expect(store.selectedField).toBeNull();
  });

  it('leaves the selection untouched when a non-selected field is removed', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const selectedId = store.selectedField!.id;
    const otherId = store.fields[0]!.id;

    store.removeField(otherId);

    expect(store.selectedField?.id).toBe(selectedId);
  });

  it('merges an update into the selected field', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.updateSelectedField({ key: 'newKey', title: 'Full name', minLength: 2 });

    expect(store.selectedField).toMatchObject({ key: 'newKey', title: 'Full name', minLength: 2 });
  });

  it('does nothing when there is no selected field', () => {
    const store = useFormBuilderStore();

    expect(() => store.updateSelectedField({ title: 'Untitled' })).not.toThrow();
    expect(store.selectedField).toBeNull();
  });

  it('clears a rule referencing a removed field, without touching rules on other fields', () => {
    const store = useFormBuilderStore();

    store.addField('selection');
    const dependency = store.fields[0]!;
    store.addField('text');
    store.selectField(store.fields[1]!.id);
    store.updateSelectedField({
      conditions: {
        operator: 'and',
        rules: [{ id: 'rule-1', field: dependency.key, type: 'equals', values: ['option_1'] }],
      },
    });

    store.removeField(dependency.id);

    expect(store.fields[0]!.conditions?.rules[0]?.field).toBe('');
  });

  it('rewrites a rule when the field it depends on is renamed', () => {
    const store = useFormBuilderStore();

    store.addField('selection');
    const dependency = store.fields[0]!;
    store.addField('text');
    store.selectField(store.fields[1]!.id);
    store.updateSelectedField({
      conditions: {
        operator: 'and',
        rules: [{ id: 'rule-1', field: dependency.key, type: 'equals', values: ['option_1'] }],
      },
    });

    store.selectField(dependency.id);
    store.updateSelectedField({ key: 'renamedDependency' });

    expect(store.fields[1]!.conditions?.rules[0]?.field).toBe('renamedDependency');
  });

  it('ignores properties that do not belong to the selected field type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = useFormBuilderStore();

    store.addField('text');
    // isFloat type-checks against FieldUpdate's NumberField branch, so this call is
    // valid TypeScript even though a TextField is selected - it's the runtime guard's
    // job to reject it, since the store can't statically know the selected field's type.
    store.updateSelectedField({ isFloat: true });

    expect(store.selectedField).not.toHaveProperty('isFloat');

    warnSpy.mockRestore();
  });

  it('reorders fields to match the given id order', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    store.addField('selection');
    const [first, second, third] = store.fields;

    store.reorderFields([third!.id, first!.id, second!.id]);

    expect(store.fields.map((field) => field.id)).toEqual([third!.id, first!.id, second!.id]);
  });

  it('preserves field object identity when reordering, not just values', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first, second] = store.fields;

    store.reorderFields([second!.id, first!.id]);

    expect(store.fields[0]).toBe(second);
    expect(store.fields[1]).toBe(first);
  });

  it('ignores a reorder that does not account for every current field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first] = store.fields;
    const originalOrder = store.fields.map((field) => field.id);

    store.reorderFields([first!.id]);

    expect(store.fields.map((field) => field.id)).toEqual(originalOrder);

    warnSpy.mockRestore();
  });

  it('ignores a reorder containing an id that does not belong to any current field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first] = store.fields;
    const originalOrder = store.fields.map((field) => field.id);

    store.reorderFields([first!.id, 'not-a-real-id']);

    expect(store.fields.map((field) => field.id)).toEqual(originalOrder);

    warnSpy.mockRestore();
  });

  describe('undo/redo', () => {
    it('has nothing to undo or redo initially', () => {
      const store = useFormBuilderStore();

      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(false);
    });

    it('undoes adding a field', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.undo();

      expect(store.fields).toHaveLength(0);
      expect(store.canRedo).toBe(true);
    });

    it('redoes an undone add', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      const id = store.fields[0]!.id;
      store.undo();
      store.redo();

      expect(store.fields).toHaveLength(1);
      expect(store.fields[0]!.id).toBe(id);
    });

    it('undoes removing a field, including its selection', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      const id = store.fields[0]!.id;
      store.removeField(id);
      store.undo();

      expect(store.fields).toHaveLength(1);
      expect(store.selectedField?.id).toBe(id);
    });

    it('undoes a reorder', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.addField('number');
      const [first, second] = store.fields;

      store.reorderFields([second!.id, first!.id]);
      store.undo();

      expect(store.fields.map((field) => field.id)).toEqual([first!.id, second!.id]);
    });

    it('undoes a property update', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.updateSelectedField({ title: 'Renamed' });
      store.undo();

      expect(store.selectedField?.title).toBe('Text field');
    });

    it('does not record a step for an update with no valid properties', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useFormBuilderStore();

      store.addField('text');
      store.undo();
      expect(store.canUndo).toBe(false);

      store.addField('text');
      store.updateSelectedField({ isFloat: true });

      expect(store.canUndo).toBe(true);
      store.undo();
      expect(store.fields).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('starting a new action clears the redo stack', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.undo();
      expect(store.canRedo).toBe(true);

      store.addField('number');

      expect(store.canRedo).toBe(false);
    });

    describe('coalescing rapid edits to the same field', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('treats a burst of edits to the same field as a single undo step', () => {
        const store = useFormBuilderStore();

        store.addField('text');
        store.updateSelectedField({ title: 'R' });
        store.updateSelectedField({ title: 'Re' });
        store.updateSelectedField({ title: 'Ren' });

        store.undo();

        expect(store.selectedField?.title).toBe('Text field');
      });

      it('starts a new undo step once the coalescing window has passed', () => {
        const store = useFormBuilderStore();

        store.addField('text');
        store.updateSelectedField({ title: 'First edit' });
        vi.advanceTimersByTime(1000);
        store.updateSelectedField({ title: 'Second edit' });

        store.undo();
        expect(store.selectedField?.title).toBe('First edit');

        store.undo();
        expect(store.selectedField?.title).toBe('Text field');
      });

      it('does not coalesce edits to different fields', () => {
        const store = useFormBuilderStore();

        store.addField('text');
        store.addField('number');
        const [first, second] = store.fields;

        store.selectField(first!.id);
        store.updateSelectedField({ title: 'First edited' });
        store.selectField(second!.id);
        store.updateSelectedField({ title: 'Second edited' });

        store.undo();
        expect(store.fields.find((field) => field.id === second!.id)?.title).toBe('Number field');

        store.undo();
        expect(store.fields.find((field) => field.id === first!.id)?.title).toBe('Text field');
      });
    });
  });

  describe('validity', () => {
    it('has no invalid fields for a freshly-added field', () => {
      const store = useFormBuilderStore();

      store.addField('number');

      expect(store.hasInvalidFields).toBe(false);
      expect(store.invalidFieldIds.size).toBe(0);
    });

    it('flags a field whose properties fail validation', () => {
      const store = useFormBuilderStore();

      store.addField('number');
      store.updateSelectedField({ min: 10, max: 5 });

      expect(store.hasInvalidFields).toBe(true);
      expect(store.invalidFieldIds.has(store.fields[0]!.id)).toBe(true);
    });

    it('clears once the offending property is fixed', () => {
      const store = useFormBuilderStore();

      store.addField('number');
      store.updateSelectedField({ min: 10, max: 5 });
      store.updateSelectedField({ max: 20 });

      expect(store.hasInvalidFields).toBe(false);
    });

    it('flags a selection field with no options', () => {
      const store = useFormBuilderStore();

      store.addField('selection');
      store.updateSelectedField({ options: [] });

      expect(store.hasInvalidFields).toBe(true);
    });
  });

  describe('selection option pruning on leaving the field', () => {
    const addBlankOption = (store: ReturnType<typeof useFormBuilderStore>) => {
      const field = store.selectedField as SelectionField;
      store.updateSelectedField({
        options: [...field.options, { id: 'blank', label: '', value: '' }],
      });
    };

    it('drops an option with no label or value when selecting a different field', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.addField('selection');
      addBlankOption(store);

      store.selectField(store.fields[0]!.id);

      const selection = store.fields[1] as SelectionField;
      expect(selection.options).toHaveLength(1);
    });

    it('drops an option with no label or value when a new field is added', () => {
      const store = useFormBuilderStore();

      store.addField('selection');
      addBlankOption(store);

      store.addField('text');

      const selection = store.fields[0] as SelectionField;
      expect(selection.options).toHaveLength(1);
    });

    it('drops an option with no label or value when deselecting', () => {
      const store = useFormBuilderStore();

      store.addField('selection');
      addBlankOption(store);
      store.deselectField();

      const selection = store.fields[0] as SelectionField;
      expect(selection.options).toHaveLength(1);
    });

    it('keeps options that have both a label and a value', () => {
      const store = useFormBuilderStore();

      store.addField('selection');
      store.deselectField();

      const selection = store.fields[0] as SelectionField;
      expect(selection.options).toHaveLength(1);
    });
  });

  describe('touchedFieldIds', () => {
    it('starts empty', () => {
      const store = useFormBuilderStore();

      expect(store.touchedFieldIds.size).toBe(0);
    });

    it('touches the field being left when selecting a different one', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      const first = store.fields[0]!.id;
      store.addField('number');

      expect(store.touchedFieldIds.has(first)).toBe(true);
    });

    it('touches the field being left when deselecting', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      const id = store.fields[0]!.id;
      store.deselectField();

      expect(store.touchedFieldIds.has(id)).toBe(true);
    });

    it('does not touch a field while it remains selected', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      const id = store.fields[0]!.id;

      expect(store.touchedFieldIds.has(id)).toBe(false);
    });

    it('touches every current field via markAllTouched', () => {
      const store = useFormBuilderStore();

      store.addField('text');
      store.addField('number');
      const ids = store.fields.map((field) => field.id);

      store.markAllTouched();

      expect(ids.every((id) => store.touchedFieldIds.has(id))).toBe(true);
    });
  });
});
