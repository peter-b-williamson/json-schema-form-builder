import { describe, it, expect } from 'vitest';

import { createField } from '../registry';
import {
  getConditionErrors,
  getFieldPropertyErrors,
  validateFieldValue,
} from '../propertyValidation';
import type { FieldCondition, NumberField, SelectionField, TextField } from '../types';

const rule = (overrides: Partial<FieldCondition> = {}): FieldCondition => ({
  id: crypto.randomUUID(),
  field: 'depends',
  type: 'equals',
  values: ['a'],
  ...overrides,
});

describe('getFieldPropertyErrors', () => {
  describe('number field', () => {
    it('has no errors when min and max are unset', () => {
      const field = createField('number') as NumberField;

      expect(getFieldPropertyErrors(field, [field])).toEqual([]);
    });

    it('has no errors when max is greater than or equal to min', () => {
      const equal: NumberField = { ...(createField('number') as NumberField), min: 5, max: 5 };
      const greater: NumberField = { ...(createField('number') as NumberField), min: 0, max: 10 };

      expect(getFieldPropertyErrors(equal, [equal])).toEqual([]);
      expect(getFieldPropertyErrors(greater, [greater])).toEqual([]);
    });

    it('flags both min and max when max is less than min', () => {
      const field: NumberField = { ...(createField('number') as NumberField), min: 10, max: 5 };

      const errors = getFieldPropertyErrors(field, [field]);

      expect(errors).toContainEqual({
        path: 'min',
        message: 'Minimum must be less than or equal to maximum',
        reason: 'invalid',
      });
      expect(errors).toContainEqual({
        path: 'max',
        message: 'Maximum must be greater than or equal to minimum',
        reason: 'invalid',
      });
    });
  });

  describe('text field', () => {
    it('has no errors when minLength/maxLength are unset', () => {
      const field = createField('text') as TextField;

      expect(getFieldPropertyErrors(field, [field])).toEqual([]);
    });

    it('flags a minLength of 0 or below', () => {
      const field: TextField = { ...(createField('text') as TextField), minLength: 0 };

      expect(getFieldPropertyErrors(field, [field])).toContainEqual({
        path: 'minLength',
        message: 'Minimum length must be greater than 0',
        reason: 'invalid',
      });
    });

    it('flags a maxLength of 0 or below', () => {
      const field: TextField = { ...(createField('text') as TextField), maxLength: -1 };

      expect(getFieldPropertyErrors(field, [field])).toContainEqual({
        path: 'maxLength',
        message: 'Maximum length must be greater than 0',
        reason: 'invalid',
      });
    });

    it('flags both bounds when maxLength is less than minLength', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: 5,
        maxLength: 2,
      };

      const errors = getFieldPropertyErrors(field, [field]);

      expect(errors).toContainEqual({
        path: 'minLength',
        message: 'Minimum length must be less than or equal to maximum length',
        reason: 'invalid',
      });
      expect(errors).toContainEqual({
        path: 'maxLength',
        message: 'Maximum length must be greater than or equal to minimum length',
        reason: 'invalid',
      });
    });

    it('does not also report the ordering error when a bound already fails the >0 check', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: -1,
        maxLength: -5,
      };

      const errors = getFieldPropertyErrors(field, [field]);

      expect(errors).toHaveLength(2);
      expect(errors.map((error) => error.message)).not.toContain(
        'Minimum length must be less than or equal to maximum length',
      );
    });

    it('has no errors within valid, correctly-ordered bounds', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: 2,
        maxLength: 5,
      };

      expect(getFieldPropertyErrors(field, [field])).toEqual([]);
    });
  });

  describe('selection field', () => {
    it('has no errors with at least one option', () => {
      const field = createField('selection') as SelectionField;

      expect(getFieldPropertyErrors(field, [field])).toEqual([]);
    });

    it('flags an empty options list', () => {
      const field: SelectionField = {
        ...(createField('selection') as SelectionField),
        options: [],
      };

      expect(getFieldPropertyErrors(field, [field])).toEqual([
        { path: 'options', message: 'Must have at least one option', reason: 'invalid' },
      ]);
    });
  });

  describe('merging condition errors', () => {
    it('includes condition errors alongside type-specific ones', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: 0,
        conditions: {
          operator: 'and',
          rules: [{ id: 'rule-1', field: '', type: 'equals', values: [] }],
        },
      };

      const errors = getFieldPropertyErrors(field, [field]);

      expect(errors).toContainEqual({
        path: 'minLength',
        message: 'Minimum length must be greater than 0',
        reason: 'invalid',
      });
      expect(errors).toContainEqual({
        path: 'condition:rule-1:field',
        message: 'Select a field this condition depends on',
        reason: 'missing',
      });
    });
  });
});

describe('validateFieldValue', () => {
  it('accepts a text value within bounds', () => {
    const field: TextField = { ...(createField('text') as TextField), minLength: 2, maxLength: 5 };

    expect(validateFieldValue(field, 'abc')).toBeNull();
  });

  it('rejects a text value outside minLength/maxLength', () => {
    const field: TextField = { ...(createField('text') as TextField), minLength: 3, maxLength: 5 };

    expect(validateFieldValue(field, 'ab')).toContain('shorter');
    expect(validateFieldValue(field, 'abcdef')).toContain('longer');
  });

  it('rejects a non-numeric value for a number field', () => {
    const field = createField('number') as NumberField;

    expect(validateFieldValue(field, 'abc')).toContain('not a valid number');
  });

  it('rejects a fractional value for a whole-number field', () => {
    const field: NumberField = { ...(createField('number') as NumberField), isFloat: false };

    expect(validateFieldValue(field, '1.5')).toContain('whole number');
  });

  it('rejects a number value outside min/max', () => {
    const field: NumberField = { ...(createField('number') as NumberField), min: 0, max: 10 };

    expect(validateFieldValue(field, '-1')).toContain('below');
    expect(validateFieldValue(field, '11')).toContain('above');
  });

  it('accepts a number value within bounds', () => {
    const field: NumberField = { ...(createField('number') as NumberField), min: 0, max: 10 };

    expect(validateFieldValue(field, '5')).toBeNull();
  });

  it('accepts a value matching a current selection option, rejects one that does not', () => {
    const field = createField('selection') as SelectionField;

    expect(validateFieldValue(field, 'option_1')).toBeNull();
    expect(validateFieldValue(field, 'not_an_option')).toContain('not an option');
  });
});

describe('getConditionErrors', () => {
  it('has no errors when the field has no conditions', () => {
    const field = createField('text');

    expect(getConditionErrors(field, [field])).toEqual([]);
  });

  it('marks an unset field reference as missing, not invalid', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: '', values: [] })] },
    };

    expect(getConditionErrors(field, [field])).toEqual([
      {
        path: `condition:${field.conditions!.rules[0]!.id}:field`,
        message: 'Select a field this condition depends on',
        reason: 'missing',
      },
    ]);
  });

  it('marks a reference to a field that no longer exists as invalid, not missing', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'gone', values: ['a'] })] },
    };

    expect(getConditionErrors(field, [field])).toEqual([
      {
        path: `condition:${field.conditions!.rules[0]!.id}:field`,
        message: '"gone" is not a field in this form',
        reason: 'invalid',
      },
    ]);
  });

  it('marks an empty values array on a resolved reference as missing, not invalid', () => {
    const referenced: TextField = { ...(createField('text') as TextField), key: 'depends' };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'depends', values: [] })] },
    };

    expect(getConditionErrors(field, [referenced, field])).toEqual([
      {
        path: `condition:${field.conditions!.rules[0]!.id}:values`,
        message: 'Select at least one value',
        reason: 'missing',
      },
    ]);
  });

  it("flags a condition value outside the referenced number field's bounds", () => {
    const referenced: NumberField = {
      ...(createField('number') as NumberField),
      key: 'age',
      min: 18,
      max: 65,
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'age', values: ['10'] })] },
    };

    const errors = getConditionErrors(field, [referenced, field]);

    expect(errors).toEqual([
      {
        path: `condition:${field.conditions!.rules[0]!.id}:values`,
        message: expect.stringContaining('below'),
        reason: 'invalid',
      },
    ]);
  });

  it('flags a non-numeric condition value against a number field', () => {
    const referenced: NumberField = { ...(createField('number') as NumberField), key: 'age' };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'age', values: ['abc'] })] },
    };

    const errors = getConditionErrors(field, [referenced, field]);

    expect(errors[0]?.message).toContain('not a valid number');
  });

  it('flags a fractional condition value against a whole-number field', () => {
    const referenced: NumberField = {
      ...(createField('number') as NumberField),
      key: 'age',
      isFloat: false,
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'age', values: ['1.5'] })] },
    };

    const errors = getConditionErrors(field, [referenced, field]);

    expect(errors[0]?.message).toContain('whole number');
  });

  it('flags a condition value shorter/longer than the referenced text field allows', () => {
    const referenced: TextField = {
      ...(createField('text') as TextField),
      key: 'name',
      minLength: 3,
      maxLength: 5,
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'name', values: ['ab'] })] },
    };

    const errors = getConditionErrors(field, [referenced, field]);

    expect(errors[0]?.message).toContain('shorter');
  });

  it("flags a condition value that is not one of the referenced selection field's current options", () => {
    const referenced: SelectionField = {
      ...(createField('selection') as SelectionField),
      key: 'country',
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: {
        operator: 'and',
        rules: [rule({ field: 'country', values: ['deleted_option'] })],
      },
    };

    const errors = getConditionErrors(field, [referenced, field]);

    expect(errors[0]?.message).toContain('not an option');
  });

  it('has no error for a condition value that matches a current selection option', () => {
    const referenced: SelectionField = {
      ...(createField('selection') as SelectionField),
      key: 'country',
    };
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: { operator: 'and', rules: [rule({ field: 'country', values: ['option_1'] })] },
    };

    expect(getConditionErrors(field, [referenced, field])).toEqual([]);
  });
});
