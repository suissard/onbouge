<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Event' : 'Create Event' }}</h1>
    <DynamicUpdateForm v-if="event" :initial-data="event" :model-class="Event"
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

const strapiObject = new StrapiObject<Event>(
  eventStore,
  notificationStore,
  router,
  'events',
  'Event'
)

onMounted(async () => {

  if (isEditing.value && eventId.value) {
    // Use elaborate populate to get participants (profiles) details
    const fetchedEvent = await strapiObject.get(eventId.value, {
      populate: {
        activities: { populate: '*' },
        poi: { populate: '*' },
        profiles: { populate: '*' },
        author: { populate: '*' }
      }
    })

    if (fetchedEvent) {
      // Clone to avoid mutating store directly and to handle transforms
      event.value = { ...fetchedEvent }

      // Sync fetched participants with profilesStore to ensure they are in the dropdown/chips options
      if (fetchedEvent.profiles) {
        fetchedEvent.profiles.forEach((p: Profile) => {
          if (!profilesStore.datas.find((existing: Profile) => existing.documentId === p.documentId)) {
            profilesStore.datas.push(p)
          }
        })
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
