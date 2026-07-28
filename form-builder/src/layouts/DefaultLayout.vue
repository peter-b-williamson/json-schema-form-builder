<template>
  <v-app-bar>
    <v-toolbar-title data-cy="app-title">JSON Schema Form Builder</v-toolbar-title>
    <template #append>
      <ThemeToggle />
    </template>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>
