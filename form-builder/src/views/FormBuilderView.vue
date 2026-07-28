<template>
  <ThreeColumnLayout storage-key="form-builder-panel-sizes">
    <template #left>
      <div class="pa-4">
        <h2 class="text-h6" data-cy="panel-heading-palette">Component Palette</h2>
      </div>
    </template>
    <template #center>
      <div class="pa-4">
        <h2 class="text-h6" data-cy="panel-heading-form">Form</h2>
      </div>
    </template>
    <template #right>
      <div class="pa-4">
        <h2 class="text-h6" data-cy="panel-heading-properties">Properties</h2>
      </div>
    </template>
  </ThreeColumnLayout>
</template>

<script setup lang="ts">
import ThreeColumnLayout from '@/components/ThreeColumnLayout.vue';
</script>
