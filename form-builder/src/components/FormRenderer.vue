<template>
  <div data-cy="form-renderer">
    <template v-if="fields.length">
      <v-form ref="formRef" class="d-flex flex-column ga-4" data-cy="form-renderer-form">
        <template v-for="(field, index) in fields" :key="field.id">
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis" :data-cy="`preview-index-${field.id}`">
              {{ index + 1 }}
            </span>
            <div class="flex-grow-1">
              <TextFieldRenderer
                v-if="isTextField(field)"
                v-model="values[field.id] as string | undefined"
                :field="field"
                @update:focused="(focused: boolean) => onFieldFocused(focused, field.id)"
              />
              <NumberFieldRenderer
                v-else-if="isNumberField(field)"
                v-model="values[field.id] as number | null | undefined"
                :field="field"
                @update:focused="(focused: boolean) => onFieldFocused(focused, field.id)"
              />
              <SelectionFieldRenderer
                v-else-if="isSelectionField(field)"
                v-model="values[field.id] as string | string[] | undefined"
                :field="field"
                @update:focused="(focused: boolean) => onFieldFocused(focused, field.id)"
              />
            </div>
          </div>
        </template>
      </v-form>

      <v-btn
        text="Reset"
        variant="tonal"
        prepend-icon="mdi-refresh"
        class="mt-4"
        data-cy="form-renderer-reset-button"
        @click="onReset"
      />
    </template>

    <p
      v-else
      class="font-italic font-weight-light bg-surfaceContainerLow"
      data-cy="form-renderer-empty"
    >
      No fields to preview yet.<br />Add one from the palette to see it rendered here.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { VForm } from 'vuetify/components';

import { isNumberField, isSelectionField, isTextField } from '@/fields/guards';
import { useFormBuilderStore } from '@/stores/formBuilder';

import NumberFieldRenderer from '@/components/fieldRenderers/NumberFieldRenderer.vue';
import SelectionFieldRenderer from '@/components/fieldRenderers/SelectionFieldRenderer.vue';
import TextFieldRenderer from '@/components/fieldRenderers/TextFieldRenderer.vue';

// Props
const props = withDefaults(defineProps<{ selectOnFocus?: boolean }>(), {
  selectOnFocus: true,
});

// Composables
const formStore = useFormBuilderStore();

// State
const values = reactive<Record<string, unknown>>({});
const formRef = ref<VForm>();

// Computed
const fields = computed(() => formStore.fields);

// Methods
const onFieldFocused = (focused: boolean, id: string) => {
  if (focused && props.selectOnFocus) formStore.selectField(id);
};

const onReset = () => {
  Object.keys(values).forEach((id) => delete values[id]);
  formRef.value?.resetValidation();
};
</script>
