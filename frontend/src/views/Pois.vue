<template>
  <v-container>
    <h1>POIs</h1>
    <v-list>
      <v-list-item v-for="poi in poiStore.pois" :key="poi.id">
        <v-list-item-title>{{ poi.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ poi.type }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { usePoiStore } from '@/stores/pois'
import { onMounted } from 'vue'

const poiStore = usePoiStore()

onMounted(() => {
  poiStore.fetchPois()
})
</script>
