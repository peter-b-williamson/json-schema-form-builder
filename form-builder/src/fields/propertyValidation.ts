import type { FormField, NumberField, SelectionField, TextField } from './types';

export interface FieldPropertyError {
  // Property (or `condition:<ruleId>:field` / `condition:<ruleId>:values`) this error belongs to
  path: string;
  message: string;
  // `invalid`: the value is present but wrong, shown immediately
  // `missing`: a required value hasn't been provided yet, deferred in the property editor until
  // the field is touched or export is attempted.
  reason: 'invalid' | 'missing';
}

const numberFieldErrors = (field: NumberField): FieldPropertyError[] => {
  if (field.min === undefined || field.max === undefined || field.max >= field.min) return [];

  return [
    { path: 'min', message: 'Minimum must be less than or equal to maximum', reason: 'invalid' },
    { path: 'max', message: 'Maximum must be greater than or equal to minimum', reason: 'invalid' },
  ];
};

const textFieldErrors = (field: TextField): FieldPropertyError[] => {
  const errors: FieldPropertyError[] = [];

  const minValid = field.minLength === undefined || field.minLength > 0;
  const maxValid = field.maxLength === undefined || field.maxLength > 0;

  if (!minValid) {
    errors.push({
      path: 'minLength',
      message: 'Minimum length must be greater than 0',
      reason: 'invalid',
    });
  }
  if (!maxValid) {
    errors.push({
      path: 'maxLength',
      message: 'Maximum length must be greater than 0',
      reason: 'invalid',
    });
  }

  if (
    minValid &&
    maxValid &&
    field.minLength !== undefined &&
    field.maxLength !== undefined &&
    field.maxLength < field.minLength
  ) {
    errors.push(
      {
        path: 'minLength',
        message: 'Minimum length must be less than or equal to maximum length',
        reason: 'invalid',
      },
      {
        path: 'maxLength',
        message: 'Maximum length must be greater than or equal to minimum length',
        reason: 'invalid',
      },
    );
  }

  return errors;
};

const selectionFieldErrors = (field: SelectionField): FieldPropertyError[] =>
  field.options.length === 0
    ? [{ path: 'options', message: 'Must have at least one option', reason: 'invalid' }]
    : [];

// Checks whether a raw value would be acceptable for `field`. Switches on `field.type`,
// not is<type> guards, so a new FieldType with no case here is a compile error.
export const validateFieldValue = (field: FormField, rawValue: string): string | null => {
  switch (field.type) {
    case 'text':
      if (field.minLength !== undefined && rawValue.length < field.minLength) {
        return `"${rawValue}" is shorter than ${field.title}'s minimum length (${field.minLength})`;
      }
      if (field.maxLength !== undefined && rawValue.length > field.maxLength) {
        return `"${rawValue}" is longer than ${field.title}'s maximum length (${field.maxLength})`;
      }
      return null;
    case 'number': {
      const numeric = Number(rawValue);
      if (rawValue.trim() === '' || Number.isNaN(numeric)) {
        return `"${rawValue}" is not a valid number`;
      }
      if (!field.isFloat && !Number.isInteger(numeric)) {
        return `"${rawValue}" must be a whole number for ${field.title}`;
      }
      if (field.min !== undefined && numeric < field.min) {
        return `"${rawValue}" is below ${field.title}'s minimum (${field.min})`;
      }
      if (field.max !== undefined && numeric > field.max) {
        return `"${rawValue}" is above ${field.title}'s maximum (${field.max})`;
      }
      return null;
    }
    case 'selection': {
      const validValues = new Set(field.options.map((option) => option.value));
      return validValues.has(rawValue) ? null : `"${rawValue}" is not an option of ${field.title}`;
    }
  }
};

export const getConditionErrors = (field: FormField, fields: FormField[]): FieldPropertyError[] => {
  const group = field.conditions;
  if (!group) return [];

  return group.rules.flatMap((rule): FieldPropertyError[] => {
    if (!rule.field) {
      return [
        {
          path: `condition:${rule.id}:field`,
          message: 'Select a field this condition depends on',
          reason: 'missing',
        },
      ];
    }

    const referenced = fields.find((candidate) => candidate.key === rule.field);
    if (!referenced) {
      return [
        {
          path: `condition:${rule.id}:field`,
          message: `"${rule.field}" is not a field in this form`,
          reason: 'invalid',
        },
      ];
    }

    if (rule.values.length === 0) {
      return [
        {
          path: `condition:${rule.id}:values`,
          message: 'Select at least one value',
          reason: 'missing',
        },
      ];
    }

    const valueErrors = rule.values
      .map((value) => validateFieldValue(referenced, value))
      .filter((message): message is string => message !== null);

    return valueErrors.length
      ? [
          {
            path: `condition:${rule.id}:values`,
            message: valueErrors.join('; '),
            reason: 'invalid',
          },
        ]
      : [];
  });
};

// Switches on `field.type`, not is<type> guards, so a new FieldType with no case here is a
// compile error rather than a silently unvalidated field
export const getFieldPropertyErrors = (
  field: FormField,
  fields: FormField[],
): FieldPropertyError[] => {
  const typeErrors = (() => {
    switch (field.type) {
      case 'text':
        return textFieldErrors(field);
      case 'number':
        return numberFieldErrors(field);
      case 'selection':
        return selectionFieldErrors(field);
    }
  })();

  return [...typeErrors, ...getConditionErrors(field, fields)];
};
