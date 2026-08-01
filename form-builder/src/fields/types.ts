export type FieldType = 'text' | 'number' | 'selection';

export interface SelectOption {
  // Internal identity for the option, independent of its position in the array -
  // lets the editor UI reference/reorder/remove options without the index-as-key
  // bugs that come from list position shifting on delete. Not part of the eventual
  // JSON schema export, which will only need label/value.
  id: string;
  label: string;
  value: string;
}

interface BaseField {
  id: string;
  title: string;
  key: string;
  type: FieldType;
  required: boolean;
}

export interface TextField extends BaseField {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  isFloat: boolean;
}

export interface SelectionField extends BaseField {
  type: 'selection';
  options: SelectOption[];
  multiple: boolean;
}

export type FormField = TextField | NumberField | SelectionField;

// Distributes over FormField so each member contributes only its own properties -
// `Omit<FormField, ...>` alone would collapse to the properties common to every
// member, silently dropping type-specific ones like `minLength` or `options`.
export type FieldUpdate<T extends FormField = FormField> = T extends FormField
  ? Partial<Omit<T, 'id' | 'type'>>
  : never;
