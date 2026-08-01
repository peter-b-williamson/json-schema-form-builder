import type { FieldType, FormField, NumberField, SelectionField, TextField } from './types';

interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  icon: string;
  defaultTitle: string;
}

// Record, not an array, so adding a new FieldType without an entry here is a
// compile error rather than a silently missing palette item.
export const fieldTypeDefinitions: Record<FieldType, FieldTypeDefinition> = {
  text: {
    type: 'text',
    label: 'Text input',
    icon: 'mdi-form-textbox',
    defaultTitle: 'Text field',
  },
  number: {
    type: 'number',
    label: 'Number input',
    icon: 'mdi-numeric',
    defaultTitle: 'Number field',
  },
  selection: {
    type: 'selection',
    label: 'Selection input',
    icon: 'mdi-form-select',
    defaultTitle: 'Selection field',
  },
};

export const fieldTypeList: FieldTypeDefinition[] = Object.values(fieldTypeDefinitions);

// Runtime allow-list of updatable properties per field type, used to guard against
// applying an update shaped for the wrong field type (e.g. `isFloat` on a TextField).
// Each object is typed as Record<keyof Omit<T, 'id' | 'type'>, true>, which forces
// every property of T to be listed exactly once - add, remove, or rename a field
// property and the object literal fails to compile until this is updated to match.
type PropertyKeys<T> = Record<keyof Omit<T, 'id' | 'type'>, true>;

const textFieldKeys: PropertyKeys<TextField> = {
  title: true,
  key: true,
  required: true,
  minLength: true,
  maxLength: true,
  placeholder: true,
};

const numberFieldKeys: PropertyKeys<NumberField> = {
  title: true,
  key: true,
  required: true,
  min: true,
  max: true,
  isFloat: true,
};

const selectionFieldKeys: PropertyKeys<SelectionField> = {
  title: true,
  key: true,
  required: true,
  options: true,
  multiple: true,
};

export const fieldPropertyKeys: Record<FieldType, ReadonlySet<string>> = {
  text: new Set(Object.keys(textFieldKeys)),
  number: new Set(Object.keys(numberFieldKeys)),
  selection: new Set(Object.keys(selectionFieldKeys)),
};

export const toCamelCase = (value: string): string =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, firstCharOfWord: string) => firstCharOfWord.toUpperCase())
    .replace(/^[A-Z]/, (firstChar: string) => firstChar.toLowerCase());

export const ensureUniqueKey = (base: string, taken: ReadonlySet<string>): string => {
  const safeBase = base.trim() || 'field';
  let name = safeBase;
  let suffix = 2;
  while (taken.has(name)) {
    name = `${safeBase}${suffix}`;
    suffix += 1;
  }
  return name;
};

export const createField = (type: FieldType): FormField => {
  const title = fieldTypeDefinitions[type].defaultTitle;
  const base = {
    id: crypto.randomUUID(),
    title,
    key: toCamelCase(title),
    required: false,
  };

  switch (type) {
    case 'text':
      return { ...base, type };
    case 'number':
      return { ...base, type, isFloat: false };
    case 'selection':
      return {
        ...base,
        type,
        multiple: false,
        options: [{ id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' }],
      };
  }
};
