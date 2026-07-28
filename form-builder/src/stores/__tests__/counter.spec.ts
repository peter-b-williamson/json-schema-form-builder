import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCounterStore } from '@/stores/counter';

describe('counter store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts at zero', () => {
    const counter = useCounterStore();
    expect(counter.count).toBe(0);
  });

  it('increments the count', () => {
    const counter = useCounterStore();
    counter.increment();
    expect(counter.count).toBe(1);
  });
});
