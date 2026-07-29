<template>
  <v-list data-cy="field-palette py-0" rounded>
    <template v-for="(definition, index) in fieldTypeList" :key="definition.type">
      <v-list-item
        :prepend-icon="definition.icon"
        :title="definition.label"
        :data-cy="`add-field-${definition.type}`"
        @click="formStore.addField(definition.type)"
      />
      <v-divider v-if="index !== fieldTypeList.length - 1" opacity="1" role="presentation" />
    </template>
  </v-list>
</template>

<script setup lang="ts">
import { fieldTypeList } from '@/fields/registry';
import { useFormBuilderStore } from '@/stores/formBuilder';

// Composables
const formStore = useFormBuilderStore();
</script>
