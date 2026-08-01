<template>
  <v-app-bar>
    <v-toolbar-title data-cy="app-title">
      <h1 class="text-title-large">JSON Schema Form Builder</h1>
    </v-toolbar-title>
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
