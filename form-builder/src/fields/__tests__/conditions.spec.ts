import { describe, it, expect } from 'vitest';

import { createField } from '../registry';
import { isFieldVisible } from '../conditions';
import type { FieldCondition, SelectionField, TextField } from '../types';

const rule = (overrides: Partial<FieldCondition> = {}): FieldCondition => ({
  id: crypto.randomUUID(),
  field: 'depends',
  type: 'equals',
  values: ['a'],
  ...overrides,
});

describe('isFieldVisible', () => {
  it('is visible when there are no conditions', () => {
    const field = createField('text');

    expect(isFieldVisible(field, [field], {})).toBe(true);
  });

  it('is visible when the conditions group has no rules', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [] },
    };

    expect(isFieldVisible(field, [field], {})).toBe(true);
  });

  it('is visible when the referenced field currently matches one of the rule values', () => {
    const referenced: SelectionField = {
      ...(createField('selection') as SelectionField),
      key: 'depends',
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'depends', values: ['option_1'] })] },
    };

    const values = { [referenced.id]: 'option_1' };

    expect(isFieldVisible(field, [referenced, field], values)).toBe(true);
  });

  it('is hidden when the referenced field currently does not match any rule value', () => {
    const referenced: SelectionField = {
      ...(createField('selection') as SelectionField),
      key: 'depends',
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'depends', values: ['option_1'] })] },
    };

    const values = { [referenced.id]: 'option_2' };

    expect(isFieldVisible(field, [referenced, field], values)).toBe(false);
  });

  it('requires every rule to match under the "and" operator', () => {
    const first: TextField = { ...(createField('text') as TextField), key: 'first' };
    const second: TextField = { ...(createField('text') as TextField), key: 'second' };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: {
        operator: 'and',
        rules: [rule({ field: 'first', values: ['a'] }), rule({ field: 'second', values: ['b'] })],
      },
    };

    const allMatch = { [first.id]: 'a', [second.id]: 'b' };
    const oneMismatched = { [first.id]: 'a', [second.id]: 'nope' };

    expect(isFieldVisible(field, [first, second, field], allMatch)).toBe(true);
    expect(isFieldVisible(field, [first, second, field], oneMismatched)).toBe(false);
  });

  it('matches when a rule value appears anywhere in a multi-select current value', () => {
    const referenced: SelectionField = {
      ...(createField('selection') as SelectionField),
      key: 'depends',
      multiple: true,
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'depends', values: ['b'] })] },
    };

    const values = { [referenced.id]: ['a', 'b'] };

    expect(isFieldVisible(field, [referenced, field], values)).toBe(true);
  });

  it('fails open (stays visible) when a rule references a field that no longer exists', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'missing', values: ['a'] })] },
    };

    expect(isFieldVisible(field, [field], {})).toBe(true);
  });
});
