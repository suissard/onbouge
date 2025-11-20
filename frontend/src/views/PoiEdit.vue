<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit POI' : 'Create POI' }}</h1>
    <v-form v-if="poi" ref="form" @submit.prevent="savePoi">
      <v-text-field
        v-model="poi.title"
        label="Title"
        :rules="[rules.required]"
        required
      ></v-text-field>

      <v-textarea
        v-model="poi.description"
        label="Description"
        :rules="[rules.required]"
        required
      ></v-textarea>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="poi.lattitude"
            label="Lattitude"
            type="number"
            step="any"
            :rules="[rules.required]"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="poi.longitude"
            label="Longitude"
            type="number"
            step="any"
            :rules="[rules.required]"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-text-field
        v-model="poi.gmaps_url"
        label="Google Maps URL"
      ></v-text-field>

      <v-btn type="submit" color="primary" :loading="loading">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Poi } from '@/interfaces/poi'

const poiStore = usePoisStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const poiId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!poiId.value)

const poi = ref<Partial<Poi> | null>(null)
const loading = ref(false)

const rules = {
  required: (value: any) => !!value || 'Required.',
}

onMounted(async () => {
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
async function savePoi() {
  if (!poi.value) return

  loading.value = true

  try {
    // Ensure coordinates are numbers
    const payload = {
        ...poi.value,
        lattitude: Number(poi.value.lattitude),
        longitude: Number(poi.value.longitude)
    }

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
</script>
