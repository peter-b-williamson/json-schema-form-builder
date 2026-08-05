import { describe, it, expect } from 'vitest';

import {
  createField,
  ensureUniqueKey,
  fieldPropertyKeys,
  fieldTypeDefinitions,
  fieldTypeList,
  toCamelCase,
} from '../registry';

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
  it('generates a unique id per call', () => {
    const first = createField('text');
    const second = createField('text');

    expect(first.id).not.toBe(second.id);
  });

  it('creates a text field with the registry default title, a matching default key, and no type-specific values set', () => {
    const field = createField('text');

    expect(field).toMatchObject({
      type: 'text',
      title: fieldTypeDefinitions.text.defaultTitle,
      key: 'textField',
      required: false,
    });
  });

  it('creates a number field defaulting isFloat to false', () => {
    const field = createField('number');

    expect(field).toMatchObject({
      type: 'number',
      title: fieldTypeDefinitions.number.defaultTitle,
      key: 'numberField',
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
      ['conditions', 'key', 'maxLength', 'minLength', 'placeholder', 'required', 'title'].sort(),
    );
    expect([...fieldPropertyKeys.number].sort()).toEqual(
      ['conditions', 'isFloat', 'key', 'max', 'min', 'required', 'title'].sort(),
    );
    expect([...fieldPropertyKeys.selection].sort()).toEqual(
      ['conditions', 'key', 'multiple', 'options', 'required', 'title'].sort(),
    );
  });
});

describe('toCamelCase', () => {
  it('lowercases the first word and capitalizes the start of subsequent words', () => {
    expect(toCamelCase('Text field')).toBe('textField');
    expect(toCamelCase('  full   name  ')).toBe('fullName');
  });
});

describe('ensureUniqueKey', () => {
  it('returns the base key unchanged when it is not taken', () => {
    expect(ensureUniqueKey('title', new Set())).toBe('title');
  });

  it('appends an incrementing numeric suffix until the key is free', () => {
    expect(ensureUniqueKey('title', new Set(['title']))).toBe('title2');
    expect(ensureUniqueKey('title', new Set(['title', 'title2']))).toBe('title3');
  });
});
