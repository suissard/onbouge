<template>
  <v-container>
    <h1 class="mb-4">Edit POI</h1>
    <v-form v-if="poi" @submit.prevent="savePoi">
      <v-text-field v-model="poi.name" label="Name"></v-text-field>
      <v-textarea v-model="poi.description" label="Description"></v-textarea>
      <v-text-field v-model="poi.type" label="Type"></v-text-field>
      <v-text-field v-model="poi.image" label="Image URL"></v-text-field>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoiStore } from '@/stores/pois'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const poiStore = usePoiStore()
const route = useRoute()
const router = useRouter()
const poiId = Number(route.params.id)
const poi = ref<any>(null)

onMounted(async () => {
  await poiStore.fetchPois()
  poi.value = { ...poiStore.pois.find((p) => p.id === poiId) }
})

function savePoi() {
  if (poi.value) {
    // In a real app, you'd call an API to save the POI
    console.log('Saving POI:', poi.value)
    router.push(`/poi/view/${poiId}`)
  }
}
</script>
