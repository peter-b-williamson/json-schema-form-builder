<template>
  <v-container>
    <v-card class="mx-auto pa-4" max-width="400">
      <v-card-title>Vue 3 + Vuetify + Pinia</v-card-title>
      <v-card-text>Count: {{ counter.count }}</v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="counter.increment"> Increment </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>
