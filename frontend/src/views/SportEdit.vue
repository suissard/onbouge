<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Sport' : 'Create Sport' }}</h1>
    <DynamicUpdateForm v-if="sport" :initial-data="sport" :model-class="Sport"
      :data-sources="{ pois: poisList, events: eventsList }" :title="isEditing ? 'Edit Sport' : 'Create Sport'"
      @save="saveSport" @delete="deleteSport" />
    <v-alert v-else-if="isEditing" type="info">Loading sport...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore, usePoisStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sport } from '@/interfaces/sport'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const sportStore = useSportsStore()
const poisStore = usePoisStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const sportId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!sportId.value)

const sport = ref<Partial<Sport> | null>(null)
const loading = ref(false)

const poisList = computed(() => poisStore.datas)
const eventsList = computed(() => eventsStore.datas)

const strapiObject = new StrapiObject<Sport>(
  sportStore,
  notificationStore,
  router,
  'sports',
  'Sport'
)

onMounted(async () => {
  await Promise.all([
    poisStore.getList(),
    eventsStore.getList()
  ])

  if (isEditing.value && sportId.value) {
    const fetchedSport = await strapiObject.load(sportId.value);
    if (fetchedSport) {
      sport.value = { ...fetchedSport };
      // @ts-ignore
      if (fetchedSport.pois) sport.value.pois = fetchedSport.pois.map((p: any) => p.documentId)
      // @ts-ignore
      if (fetchedSport.events) sport.value.events = fetchedSport.events.map((e: any) => e.documentId)
    }
  } else {
    sport.value = new Sport();
  }
})

/**
 * Saves the sport data and navigates to the sport view page.
 */
async function saveSport(formData: any) {
  if (!sport.value) return

  loading.value = true

  try {
    const payload = { ...formData };
    await strapiObject.save(payload, sportId.value || undefined);
  } finally {
    loading.value = false
  }
}

async function deleteSport(formData: any) {
  if (!sportId.value) return

  loading.value = true
  try {
    await strapiObject.delete(sportId.value)
  } finally {
    loading.value = false
  }
}
</script>
