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

onMounted(async () => {
  await Promise.all([
    poisStore.getList(),
    eventsStore.getList()
  ])

  if (isEditing.value && sportId.value) {
    const fetchedSport = await sportStore.get(sportId.value);
    if (fetchedSport) {
      sport.value = { ...fetchedSport };
    } else {
      notificationStore.addNotification({ message: 'Sport not found', type: 'error' })
      router.push('/sports')
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
    // Strip read-only fields
    delete payload.id;
    delete payload.documentId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.publishedAt;

    if (isEditing.value && sportId.value) {
      await sportStore.update(sportId.value, payload);
      notificationStore.addNotification({ message: 'Sport updated successfully', type: 'success' })
      router.push(`/sports/${sportId.value}`)
    } else {
      const newSport = await sportStore.create(payload);
      if (newSport) {
        notificationStore.addNotification({ message: 'Sport created successfully', type: 'success' })
        router.push(`/sports/${newSport.documentId}`)
      }
    }
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error saving sport', type: 'error' })
  } finally {
    loading.value = false
  }
}

async function deleteSport(formData: any) {
  if (!sportId.value) return

  loading.value = true
  try {
    await sportStore.delete(sportId.value)
    notificationStore.addNotification({ message: 'Sport deleted successfully', type: 'success' })
    router.push('/sports')
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error deleting sport', type: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
