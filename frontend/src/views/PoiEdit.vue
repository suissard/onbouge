<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit POI' : 'Create POI' }}</h1>
    <DynamicUpdateForm v-if="poi" :initial-data="poi" :model-class="Poi"
      :data-sources="{ sports: sportsList, events: eventsList }" :title="isEditing ? 'Edit POI' : 'Create POI'"
      @save="savePoi" @delete="deletePoi" />
    <v-alert v-else-if="isEditing" type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore, useSportsStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Poi } from '@/interfaces/poi'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'

const poiStore = usePoisStore()
const sportsStore = useSportsStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const poiId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!poiId.value)

const poi = ref<Partial<Poi> | null>(null)
const loading = ref(false)

const sportsList = computed(() => sportsStore.datas)
const eventsList = computed(() => eventsStore.datas)

const rules = {
  required: (value: any) => !!value || 'Required.',
}

onMounted(async () => {
  await Promise.all([
    sportsStore.getList(),
    eventsStore.getList()
  ])

  if (isEditing.value && poiId.value) {
    const fetchedPoi = await poiStore.get(poiId.value)
    if (fetchedPoi) {
      poi.value = { ...fetchedPoi }
    } else {
      notificationStore.addNotification({ message: 'POI not found', type: 'error' })
      router.push('/pois')
    }
  } else {
    poi.value = {
      title: '',
      description: '',
      lattitude: 0,
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
    const payload = {
      ...formData,
      lattitude: Number(formData.lattitude),
      longitude: Number(formData.longitude)
    }

    // Strip read-only fields
    delete payload.id;
    delete payload.documentId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.publishedAt;

    if (isEditing.value && poiId.value) {
      await poiStore.update(poiId.value, payload)
      notificationStore.addNotification({ message: 'POI updated successfully', type: 'success' })
      router.push(`/pois/${poiId.value}`)
    } else {
      const newPoi = await poiStore.create(payload)
      if (newPoi) {
        notificationStore.addNotification({ message: 'POI created successfully', type: 'success' })
        router.push(`/pois/${newPoi.documentId}`)
      }
    }
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error saving POI', type: 'error' })
  } finally {
    loading.value = false
  }
}

async function deletePoi(formData: any) {
  if (!poiId.value) return

  loading.value = true
  try {
    await poiStore.delete(poiId.value)
    notificationStore.addNotification({ message: 'POI deleted successfully', type: 'success' })
    router.push('/pois')
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error deleting POI', type: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
