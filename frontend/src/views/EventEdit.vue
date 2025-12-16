<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Event' : 'Create Event' }}</h1>
    <DynamicUpdateForm v-if="event" :initial-data="event" :model-class="Event"
      :data-sources="{ activities: activitiesList, pois: poisList, profiles: profilesList, users: usersList }"
      :title="isEditing ? 'Edit Event' : 'Create Event'" @save="saveEvent" @delete="deleteEvent" />
    <v-alert v-else-if="isEditing" type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore, useActivitiesStore, usePoisStore, useProfilesStore, useUsersStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Event } from '@/interfaces/event'
import type { Activity } from '@/interfaces/activity'
import type { Profile } from '@/interfaces/profile'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const eventStore = useEventsStore()
const activitiesStore = useActivitiesStore()
const poisStore = usePoisStore()
const profilesStore = useProfilesStore()
const usersStore = useUsersStore()
const notificationStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!eventId.value)

const event = ref<Partial<Event> | null>(null)
const loading = ref(false)

const activitiesList = computed(() => activitiesStore.datas)
const poisList = computed(() => poisStore.datas)
const profilesList = computed(() => profilesStore.datas)
const usersList = computed(() => usersStore.datas)

const selectedSports = ref<string[]>([])
const selectedPoi = ref<string | null>(null)
const selectedProfiles = ref<string[]>([])

const strapiObject = new StrapiObject<Event>(
  eventStore,
  notificationStore,
  router,
  'events',
  'Event'
)

onMounted(async () => {
  // Load all necessary data
  await Promise.all([
    activitiesStore.getList(),
    poisStore.getList(),
    profilesStore.getList(),
    usersStore.getList()
  ])

  if (isEditing.value && eventId.value) {
    const fetchedEvent = await strapiObject.load(eventId.value)
    if (fetchedEvent) {
      // Clone to avoid mutating store directly and to handle transforms
      event.value = { ...fetchedEvent }

      // Initialize selections
      if (fetchedEvent.activities) {
        // @ts-ignore
        event.value.activities = fetchedEvent.activities.map((s: Activity) => s.documentId)
      }
      if (fetchedEvent.poi) {
        // @ts-ignore
        event.value.poi = fetchedEvent.poi.documentId
      }
      if (fetchedEvent.profiles) {
        // @ts-ignore
        event.value.profiles = fetchedEvent.profiles.map((p: Profile) => p.documentId)
      }

      // Format date for input type="datetime-local" if necessary
      // Assuming Strapi sends ISO string, we might need to cut it for the input
      if (event.value?.date) {
        event.value.date = new Date(event.value.date).toISOString().slice(0, 16);
      }

    }
  } else {
    event.value = {
      title: '',
      description: '',
      date: '',
    } as Partial<Event>
  }
})

/**
 * Saves the event data and navigates to the event view page.
 */
async function saveEvent(formData: any) {
  if (!event.value) return

  loading.value = true

  // Prepare payload
  const payload = {
    ...formData,
  }

  // Ensure date is in ISO format if it was changed
  if (payload.date) {
    payload.date = new Date(payload.date).toISOString();
  }

  try {
    await strapiObject.save(payload, eventId.value || undefined)
  } finally {
    loading.value = false
  }
}

async function deleteEvent(formData: any) {
  if (!eventId.value) return

  loading.value = true
  try {
    await strapiObject.delete(eventId.value)
  } finally {
    loading.value = false
  }
}
</script>
