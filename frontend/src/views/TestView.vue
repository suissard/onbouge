<template>
  <v-container>
    <h1 class="mb-4">Test Page</h1>
    <p>Number of POIs: {{ poiStore.pois.length }}</p>
    <p>Number of Events: {{ eventStore.events.length }}</p>
  </v-container>
</template>

<script setup lang="ts">
// This is a test component to display the number of POIs and Events.
import { usePoisStore, useEventsStore } from '@/stores/strapiStore'
import { onMounted } from 'vue'

const poiStore = usePoisStore()
const eventStore = useEventsStore()

onMounted(() => {
  poiStore.getList()
  eventStore.getList()
})
</script>
