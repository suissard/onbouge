<template>
  <v-container>
    <v-card v-if="poi">
      <v-img :src="poi.image" height="400px"></v-img>
      <v-card-title class="text-h4">{{ poi.name }}</v-card-title>
      <v-card-subtitle>{{ poi.type }}</v-card-subtitle>
      <v-card-text>
        <p>{{ poi.description }}</p>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoiStore } from '@/stores/pois'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const poiStore = usePoiStore()
const route = useRoute()
const poiId = Number(route.params.id)
const poi = ref<any>(null)

onMounted(async () => {
  await poiStore.fetchPois()
  poi.value = poiStore.pois.find((p) => p.id === poiId)
})
</script>
