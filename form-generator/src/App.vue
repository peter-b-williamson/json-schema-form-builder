<template>
  <v-app>
    <DefaultLayout>
      <RouterView />
    </DefaultLayout>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
</script>
