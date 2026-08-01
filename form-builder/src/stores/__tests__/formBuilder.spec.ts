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
});
