<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit POI' : 'Create POI' }}</h1>
    <v-form v-if="poi" @submit.prevent="savePoi">
      <v-text-field v-model="poi.name" label="Name"></v-text-field>
      <v-textarea v-model="poi.description" label="Description"></v-textarea>
      <v-text-field v-model="poi.type" label="Type"></v-text-field>
      <v-text-field v-model="poi.image" label="Image URL"></v-text-field>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore } from '@/stores/strapiStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const poiStore = usePoisStore()
const route = useRoute()
const router = useRouter()
const poiId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!poiId.value)

const poi = ref<any>(null)

onMounted(async () => {
  if (isEditing.value && poiId.value) {
    poi.value = await poiStore.get(poiId.value);
  } else {
    poi.value = { name: '', description: '', type: '', image: '' };
  }
})

/**
 * Saves the POI data and navigates to the POI view page.
 */
function savePoi() {
  if (poi.value) {
    // In a real app, you'd call an API to save the POI
    console.log('Saving POI:', poi.value)
    if (isEditing.value) {
      router.push(`/pois/${poiId.value}`)
    } else {
      router.push(`/pois`)
    }
  }
}
</script>
