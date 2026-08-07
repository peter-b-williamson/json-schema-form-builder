import { describe, it, expect } from 'vitest';

import { useFieldPropertyErrors } from '../useFieldPropertyErrors';
import { createField } from '@/fields/registry';
import type { TextField } from '@/fields/types';

describe('useFieldPropertyErrors', () => {
  it('excludes a missing-reason error while untouched', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: {
        operator: 'and',
        rules: [{ id: 'rule-1', field: '', type: 'equals', values: [] }],
      },
    };

    const { messagesFor } = useFieldPropertyErrors(
      () => field,
      () => [field],
      () => false,
    );

    expect(messagesFor('condition:rule-1:field')).toEqual([]);
  });

  it('includes a missing-reason error once touched', () => {
    const field: TextField = {
      ...(createField('text') as TextField),
      conditions: {
        operator: 'and',
        rules: [{ id: 'rule-1', field: '', type: 'equals', values: [] }],
      },
    };

    const { messagesFor } = useFieldPropertyErrors(
      () => field,
      () => [field],
      () => true,
    );

    expect(messagesFor('condition:rule-1:field')).toEqual([
      'Select a field this condition depends on',
    ]);
  });

  it('shows an invalid-reason error regardless of touched state', () => {
    const field: TextField = { ...(createField('text') as TextField), minLength: 0 };

    const untouched = useFieldPropertyErrors(
      () => field,
      () => [field],
      () => false,
    );
    const touched = useFieldPropertyErrors(
      () => field,
      () => [field],
      () => true,
    );

    expect(untouched.messagesFor('minLength')).toEqual(['Minimum length must be greater than 0']);
    expect(touched.messagesFor('minLength')).toEqual(['Minimum length must be greater than 0']);
  });

  it('returns no messages for a path with no matching error', () => {
    const field = createField('text') as TextField;

    const { messagesFor } = useFieldPropertyErrors(
      () => field,
      () => [field],
      () => true,
    );

    expect(messagesFor('minLength')).toEqual([]);
  });
});
