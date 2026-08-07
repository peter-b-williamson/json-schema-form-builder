import { computed } from 'vue';

import { getFieldPropertyErrors } from '@/fields/propertyValidation';
import type { FormField } from '@/fields/types';

export const useFieldPropertyErrors = (
  field: () => FormField,
  allFields: () => FormField[],
  touched: () => boolean,
) => {
  const errors = computed(() =>
    getFieldPropertyErrors(field(), allFields()).filter(
      (error) => error.reason !== 'missing' || touched(),
    ),
  );

  const messagesFor = (path: string): string[] =>
    errors.value.filter((error) => error.path === path).map((error) => error.message);

  return { errors, messagesFor };
};
