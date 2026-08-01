import { describe, it, expect } from 'vitest';

import { createField } from '../registry';
import { buildFieldRules } from '../validation';
import type { NumberField, SelectionField, TextField } from '../types';

const validate = (field: TextField | NumberField | SelectionField, value: unknown) =>
  buildFieldRules(field).map((rule) => rule(value));

describe('buildFieldRules', () => {
  describe('required', () => {
    it('passes an optional field with no value', () => {
      const field: TextField = { ...(createField('text') as TextField), required: false };

      expect(validate(field, undefined)[0]).toBe(true);
    });

    it('fails a required field with no value', () => {
      const field: TextField = { ...(createField('text') as TextField), required: true };

      expect(validate(field, undefined)[0]).toBe(`${field.title} is required`);
    });

    it('fails a required field with an empty string', () => {
      const field: TextField = { ...(createField('text') as TextField), required: true };

      expect(validate(field, '')[0]).toBe(`${field.title} is required`);
    });

    it('fails a required multi-select field with an empty array', () => {
      const field: SelectionField = {
        ...(createField('selection') as SelectionField),
        required: true,
      };

      expect(validate(field, [])[0]).toBe(`${field.title} is required`);
    });

    it('passes a required field with a value', () => {
      const field: TextField = { ...(createField('text') as TextField), required: true };

      expect(validate(field, 'Jane')[0]).toBe(true);
    });

    it('treats 0 as a present value, not an empty one', () => {
      const field: NumberField = { ...(createField('number') as NumberField), required: true };

      expect(validate(field, 0)[0]).toBe(true);
    });
  });

  describe('text field', () => {
    it('fails a value shorter than minLength', () => {
      const field: TextField = { ...(createField('text') as TextField), minLength: 3 };

      expect(validate(field, 'ab')).toContain(`${field.title} must be at least 3 characters`);
    });

    it('fails a value longer than maxLength', () => {
      const field: TextField = { ...(createField('text') as TextField), maxLength: 3 };

      expect(validate(field, 'abcd')).toContain(`${field.title} must be at most 3 characters`);
    });

    it('ignores minLength/maxLength on an empty, optional value', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: 3,
        maxLength: 5,
      };

      expect(validate(field, undefined).every((result) => result === true)).toBe(true);
    });

    it('passes a value within bounds', () => {
      const field: TextField = {
        ...(createField('text') as TextField),
        minLength: 2,
        maxLength: 4,
      };

      expect(validate(field, 'abc').every((result) => result === true)).toBe(true);
    });
  });

  describe('number field', () => {
    it('fails a value below min', () => {
      const field: NumberField = { ...(createField('number') as NumberField), min: 10 };

      expect(validate(field, 5)).toContain(`${field.title} must be at least 10`);
    });

    it('fails a value above max', () => {
      const field: NumberField = { ...(createField('number') as NumberField), max: 10 };

      expect(validate(field, 15)).toContain(`${field.title} must be at most 10`);
    });

    it('passes a value within bounds', () => {
      const field: NumberField = { ...(createField('number') as NumberField), min: 0, max: 10 };

      expect(validate(field, 5).every((result) => result === true)).toBe(true);
    });
  });

  describe('selection field', () => {
    it('has only a required rule', () => {
      const field = createField('selection') as SelectionField;

      expect(buildFieldRules(field)).toHaveLength(1);
    });
  });
});
