import type { FormField, NumberField, SelectionField, TextField } from './types';

export type ValidationRule = (value: unknown) => true | string;

const isEmpty = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const requiredRule =
  (field: FormField): ValidationRule =>
  (value) =>
    !field.required || !isEmpty(value) || `${field.title} is required`;

const textFieldRules = (field: TextField): ValidationRule[] => [
  requiredRule(field),
  (value) =>
    isEmpty(value) ||
    field.minLength === undefined ||
    String(value).length >= field.minLength ||
    `${field.title} must be at least ${field.minLength} characters`,
  (value) =>
    isEmpty(value) ||
    field.maxLength === undefined ||
    String(value).length <= field.maxLength ||
    `${field.title} must be at most ${field.maxLength} characters`,
];

const numberFieldRules = (field: NumberField): ValidationRule[] => [
  requiredRule(field),
  (value) =>
    isEmpty(value) ||
    field.min === undefined ||
    Number(value) >= field.min ||
    `${field.title} must be at least ${field.min}`,
  (value) =>
    isEmpty(value) ||
    field.max === undefined ||
    Number(value) <= field.max ||
    `${field.title} must be at most ${field.max}`,
];

const selectionFieldRules = (field: SelectionField): ValidationRule[] => [requiredRule(field)];

// Switches on `field.type`, not is<type> guards, so a new FieldType with no case here is a
// compile error rather than a silently unvalidated field
export const buildFieldRules = (field: FormField): ValidationRule[] => {
  switch (field.type) {
    case 'text':
      return textFieldRules(field);
    case 'number':
      return numberFieldRules(field);
    case 'selection':
      return selectionFieldRules(field);
  }
};
