import { ref, watch, type Ref } from 'vue';

export const useLocalStorage = <T>(key: string, defaultValue: T): Ref<T> => {
  const stored = localStorage.getItem(key);

  let initialValue = defaultValue;
  if (stored !== null) {
    try {
      initialValue = JSON.parse(stored) as T;
    } catch {
      initialValue = defaultValue;
    }
  }

  const state = ref(initialValue) as Ref<T>;

  watch(
    state,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { deep: true },
  );

  return state;
};
