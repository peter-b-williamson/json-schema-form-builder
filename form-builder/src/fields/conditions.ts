import type { FieldCondition, FormField } from './types';

const matchesValue = (value: unknown, target: string): boolean =>
  (!!value || value === 0) && value === target;

const evaluateRule = (
  rule: FieldCondition,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean => {
  const referencedField = fields.find((field) => field.key === rule.field);
  if (!referencedField) return true;

  const currentValue = values[referencedField.id];
  switch (rule.type) {
    case 'equals':
      return rule.values.some((target) =>
        Array.isArray(currentValue)
          ? currentValue.some((value) => matchesValue(value, target))
          : matchesValue(currentValue, target),
      );
  }
};

export const isFieldVisible = (
  field: FormField,
  fields: FormField[],
  values: Record<string, unknown>,
): boolean => {
  const group = field.conditions;
  if (!group || group.rules.length === 0) return true;

  switch (group.operator) {
    case 'and':
      return group.rules.every((rule) => evaluateRule(rule, fields, values));
  }
};
