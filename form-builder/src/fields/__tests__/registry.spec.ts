import { describe, it, expect } from 'vitest';

import { createField, fieldPropertyKeys, fieldTypeDefinitions, fieldTypeList } from '../registry';

describe('fieldTypeDefinitions', () => {
  it('lists one definition per field type', () => {
    expect(fieldTypeList).toHaveLength(3);
    expect(fieldTypeList.map((definition) => definition.type).sort()).toEqual([
      'number',
      'selection',
      'text',
    ]);
  });
});

describe('createField', () => {
  it('generates a unique key per call', () => {
    const first = createField('text');
    const second = createField('text');

    expect(first.key).not.toBe(second.key);
  });

  it('creates a text field with the registry default title and no type-specific values set', () => {
    const field = createField('text');

    expect(field).toMatchObject({
      type: 'text',
      title: fieldTypeDefinitions.text.defaultTitle,
      required: false,
    });
  });

  it('creates a number field defaulting isFloat to false', () => {
    const field = createField('number');

    expect(field).toMatchObject({
      type: 'number',
      title: fieldTypeDefinitions.number.defaultTitle,
      required: false,
      isFloat: false,
    });
  });

  it('creates a selection field with a single default option and multiple disabled', () => {
    const field = createField('selection');

    expect(field.type).toBe('selection');
    if (field.type !== 'selection') return;

    expect(field.multiple).toBe(false);
    expect(field.options).toHaveLength(1);
    expect(field.options[0]).toMatchObject({ label: 'Option 1', value: 'option_1' });
    expect(field.options[0]?.id).toBeTruthy();
  });
});

describe('fieldPropertyKeys', () => {
  it('lists the updatable properties for each field type', () => {
    expect([...fieldPropertyKeys.text].sort()).toEqual(
      ['maxLength', 'minLength', 'placeholder', 'required', 'title'].sort(),
    );
    expect([...fieldPropertyKeys.number].sort()).toEqual(
      ['isFloat', 'max', 'min', 'required', 'title'].sort(),
    );
    expect([...fieldPropertyKeys.selection].sort()).toEqual(
      ['multiple', 'options', 'required', 'title'].sort(),
    );
  });
});
