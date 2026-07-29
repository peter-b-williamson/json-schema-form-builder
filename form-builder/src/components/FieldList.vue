<template>
  <v-list data-cy="field-list" class="field-list py-0" rounded color="primary">
    <template v-for="(field, index) in formStore.fields" :key="field.key">
      <v-list-item
        :active="field.key === formStore.selectedKey"
        :prepend-icon="fieldTypeDefinitions[field.type].icon"
        :title="field.title"
        :subtitle="fieldTypeDefinitions[field.type].label"
        :data-cy="`field-list-item-${field.key}`"
        class="my-1"
        @click="formStore.selectField(field.key)"
      >
        <template #append>
          <v-btn
            icon="mdi-delete"
            density="compact"
            variant="text"
            :aria-label="`Remove ${field.title}`"
            :data-cy="`remove-field-button-${field.key}`"
            @click.stop="formStore.removeField(field.key)"
          />
        </template>
      </v-list-item>
      <v-divider v-if="index !== formStore.fields.length - 1" opacity="1" role="presentation" />
    </template>

    <v-list-item
      v-if="formStore.fields.length === 0"
      data-cy="field-list-empty"
      class="font-italic font-weight-light px-0 bg-surfaceContainerLow"
    >
      No fields added yet.<br />Add one from the palette on the left.
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { fieldTypeDefinitions } from '@/fields/registry';
import { useFormBuilderStore } from '@/stores/formBuilder';

// Composables
const formStore = useFormBuilderStore();
</script>

<style>
.field-list .v-list-item-title {
  white-space: normal;
}
</style>
