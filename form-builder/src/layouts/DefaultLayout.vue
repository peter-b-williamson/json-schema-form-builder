<template>
  <v-app-bar title="JSON Schema Form Builder">
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
