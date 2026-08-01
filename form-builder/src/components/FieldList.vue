<template>
  <v-list data-cy="field-list" class="field-list py-0" rounded color="primary">
    <v-list-item
      v-if="fields.length === 0"
      data-cy="field-list-empty"
      class="font-italic font-weight-light px-0 bg-surfaceContainerLow"
    >
      No fields added yet.<br />Add one from the palette on the left.
    </v-list-item>
    <VueDraggable
      v-else
      v-model="fields"
      tag="div"
      draggable=".v-list-item"
      filter=".field-remove-button"
      :prevent-on-filter="false"
      :animation="150"
      ghost-class="opacity-50"
      :force-fallback="true"
      :support-pointer="false"
    >
      <template v-for="(field, index) in fields" :key="field.id">
        <v-list-item
          :active="field.id === formStore.selectedId"
          :title="field.title"
          :subtitle="fieldTypeDefinitions[field.type].label"
          :data-cy="`field-list-item-${field.id}`"
          class="my-1"
          @click="formStore.selectField(field.id)"
        >
          <template #prepend>
            <v-icon icon="mdi-drag-vertical" class="mr-1" />
            <span
              class="text-caption text-medium-emphasis mr-2"
              :data-cy="`field-index-${field.id}`"
            >
              {{ index + 1 }}
            </span>
            <v-icon :icon="fieldTypeDefinitions[field.type].icon" />
          </template>

          <template #append>
            <v-btn
              icon="mdi-delete"
              density="compact"
              variant="text"
              class="field-remove-button"
              :aria-label="`Remove ${field.title}`"
              :data-cy="`remove-field-button-${field.id}`"
              @click.stop="formStore.removeField(field.id)"
            />
          </template>
        </v-list-item>
        <v-divider v-if="index !== fields.length - 1" opacity="1" role="presentation" />
      </template>
    </VueDraggable>
  </v-list>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

import { fieldTypeDefinitions } from '@/fields/registry';
import { useFormBuilderStore } from '@/stores/formBuilder';

// Composables
const formStore = useFormBuilderStore();

// Computed
const fields = computed({
  get: () => formStore.fields,
  set: (value) => formStore.reorderFields(value.map((field) => field.id)),
});
</script>

<style>
.field-list .v-list-item-title {
  white-space: normal;
}

.field-list .v-list-item {
  cursor: grab;
}

.field-list .field-remove-button {
  cursor: pointer;
}
</style>
