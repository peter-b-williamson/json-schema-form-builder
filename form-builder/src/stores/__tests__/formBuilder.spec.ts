import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useFormBuilderStore } from '../formBuilder';

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

  it('selecting a later field replaces the current selection', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');

    expect(store.selectedField?.key).toBe(store.fields[1]?.key);

    store.selectField(store.fields[0]?.key ?? null);

    expect(store.selectedField?.key).toBe(store.fields[0]?.key);
  });

  it('removes a field by key without disturbing the others', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first, second] = store.fields;

    store.removeField(first!.key);

    expect(store.fields).toHaveLength(1);
    expect(store.fields[0]?.key).toBe(second!.key);
  });

  it('clears the selection when the selected field is removed', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    const key = store.fields[0]!.key;

    store.removeField(key);

    expect(store.selectedField).toBeNull();
  });

  it('leaves the selection untouched when a non-selected field is removed', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const selectedKey = store.selectedField!.key;
    const otherKey = store.fields[0]!.key;

    store.removeField(otherKey);

    expect(store.selectedField?.key).toBe(selectedKey);
  });

  it('merges an update into the selected field', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.updateSelectedField({ title: 'Full name', minLength: 2 });

    expect(store.selectedField).toMatchObject({ title: 'Full name', minLength: 2 });
  });

  it('does nothing when there is no selected field', () => {
    const store = useFormBuilderStore();

    expect(() => store.updateSelectedField({ title: 'Untitled' })).not.toThrow();
    expect(store.selectedField).toBeNull();
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

  it('reorders fields to match the given key order', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    store.addField('selection');
    const [first, second, third] = store.fields;

    store.reorderFields([third!.key, first!.key, second!.key]);

    expect(store.fields.map((field) => field.key)).toEqual([third!.key, first!.key, second!.key]);
  });

  it('preserves field object identity when reordering, not just values', () => {
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first, second] = store.fields;

    store.reorderFields([second!.key, first!.key]);

    expect(store.fields[0]).toBe(second);
    expect(store.fields[1]).toBe(first);
  });

  it('ignores a reorder that does not account for every current field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first] = store.fields;
    const originalOrder = store.fields.map((field) => field.key);

    store.reorderFields([first!.key]);

    expect(store.fields.map((field) => field.key)).toEqual(originalOrder);

    warnSpy.mockRestore();
  });

  it('ignores a reorder containing a key that does not belong to any current field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = useFormBuilderStore();

    store.addField('text');
    store.addField('number');
    const [first] = store.fields;
    const originalOrder = store.fields.map((field) => field.key);

    store.reorderFields([first!.key, 'not-a-real-key']);

    expect(store.fields.map((field) => field.key)).toEqual(originalOrder);

    warnSpy.mockRestore();
  });
});
