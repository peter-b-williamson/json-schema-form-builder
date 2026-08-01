import type { FormField, NumberField, SelectionField, TextField } from './types';

export const isTextField = (field: FormField): field is TextField => field.type === 'text';

export const isNumberField = (field: FormField): field is NumberField => field.type === 'number';

export const isSelectionField = (field: FormField): field is SelectionField =>
  field.type === 'selection';
