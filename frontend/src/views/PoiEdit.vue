<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit POI' : 'Create POI' }}</h1>
    <DynamicUpdateForm v-if="poi" :initial-data="poi" :model-class="Poi" :title="isEditing ? 'Edit POI' : 'Create POI'"
      @save="savePoi" @delete="deletePoi" />
    <v-alert v-else-if="isEditing" type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore, useActivitiesStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Poi } from '@/interfaces/poi'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const poiStore = usePoisStore()
const activitiesStore = useActivitiesStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const poiId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!poiId.value)

const poi = ref<Partial<Poi> | null>(null)
const loading = ref(false)

const strapiObject = new StrapiObject<Poi>(
  poiStore,
  notificationStore,
  router,
  'pois',
  'POI'
)

onMounted(async () => {

  if (isEditing.value && poiId.value) {
    const fetchedPoi = await strapiObject.load(poiId.value)
    if (fetchedPoi) {
      poi.value = { ...fetchedPoi }
    }
  } else {
    poi.value = {
      title: '',
      description: '',
      latitude: 0,
      longitude: 0,
      gmaps_url: ''
    } as Partial<Poi>
  }
})

/**
 * Saves the POI data and navigates to the POI view page.
 */
async function savePoi(formData: any) {
  if (!poi.value) return

  loading.value = true

  try {
    // Ensure coordinates are numbers
    // Ensure coordinates are numbers if present
    // We merge with existing poi.value to ensure required fields like title are always present
    const payload = { ...poi.value, ...formData }
    if (formData.latitude !== undefined && formData.latitude !== null && formData.latitude !== '') {
      payload.latitude = Number(formData.latitude)
    }
    if (formData.longitude !== undefined && formData.longitude !== null && formData.longitude !== '') {
      payload.longitude = Number(formData.longitude)
    }

    await strapiObject.save(payload, poiId.value || undefined)
  } finally {
    loading.value = false
  }
}

async function deletePoi(formData: any) {
  if (!poiId.value) return

  loading.value = true
  try {
    await strapiObject.delete(poiId.value)
  } finally {
    loading.value = false
  }
}
</script>
