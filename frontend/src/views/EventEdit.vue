<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Event' : 'Create Event' }}</h1>
    <v-form v-if="event" ref="form" @submit.prevent="saveEvent">
      <v-text-field
        v-model="event.title"
        label="Title"
        :rules="[rules.required]"
        required
      ></v-text-field>

      <v-textarea
        v-model="event.description"
        label="Description"
        :rules="[rules.required]"
        required
      ></v-textarea>

      <v-text-field
        v-model="event.date"
        label="Date"
        type="datetime-local"
        :rules="[rules.required]"
        required
      ></v-text-field>

      <v-text-field
        v-model="event.image"
        label="Image URL"
      ></v-text-field>

      <!-- Relationships -->
      <v-select
        v-model="selectedSports"
        :items="sportsList"
        item-title="title"
        item-value="documentId"
        label="Sports"
        multiple
        chips
      ></v-select>

      <v-select
        v-model="selectedPoi"
        :items="poisList"
        item-title="title"
        item-value="documentId"
        label="POI"
        clearable
      ></v-select>

      <v-select
        v-model="selectedProfiles"
        :items="profilesList"
        item-title="username"
        item-value="documentId"
        label="Participants"
        multiple
        chips
      ></v-select>

      <v-btn type="submit" color="primary" :loading="loading">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore, useSportsStore, usePoisStore, useProfilesStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Event } from '@/interfaces/event'
import type { Sport } from '@/interfaces/sport'
import type { Poi } from '@/interfaces/poi'
import type { Profile } from '@/interfaces/profile'

const eventStore = useEventsStore()
const sportsStore = useSportsStore()
const poisStore = usePoisStore()
const profilesStore = useProfilesStore()
const notificationStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!eventId.value)

const event = ref<Partial<Event> | null>(null)
const loading = ref(false)

const sportsList = computed(() => sportsStore.datas.value)
const poisList = computed(() => poisStore.datas.value)
const profilesList = computed(() => profilesStore.datas.value)

const selectedSports = ref<string[]>([])
const selectedPoi = ref<string | null>(null)
const selectedProfiles = ref<string[]>([])

const rules = {
  required: (value: any) => !!value || 'Required.',
}

onMounted(async () => {
  // Load all necessary data
  await Promise.all([
    sportsStore.getList(),
    poisStore.getList(),
    profilesStore.getList()
  ])

  if (isEditing.value && eventId.value) {
    const fetchedEvent = await eventStore.get(eventId.value)
    if (fetchedEvent) {
      // Clone to avoid mutating store directly and to handle transforms
      event.value = { ...fetchedEvent }

      // Initialize selections
      if (fetchedEvent.sports) {
        selectedSports.value = fetchedEvent.sports.map((s: Sport) => s.documentId)
      }
      if (fetchedEvent.poi) {
        selectedPoi.value = fetchedEvent.poi.documentId
      }
      if (fetchedEvent.profiles) {
        selectedProfiles.value = fetchedEvent.profiles.map((p: Profile) => p.documentId)
      }

      // Format date for input type="datetime-local" if necessary
      // Assuming Strapi sends ISO string, we might need to cut it for the input
      if (event.value?.date) {
          event.value.date = new Date(event.value.date).toISOString().slice(0, 16);
      }

    } else {
      notificationStore.addNotification({ message: 'Event not found', type: 'error' })
      router.push('/events')
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
async function saveEvent() {
  if (!event.value) return

  loading.value = true

  // Prepare payload
  const payload = {
    ...event.value,
    sports: selectedSports.value, // Strapi expects IDs or array of IDs
    poi: selectedPoi.value,
    profiles: selectedProfiles.value
  }

  // Ensure date is in ISO format if it was changed
  if (payload.date) {
      payload.date = new Date(payload.date).toISOString();
  }

  try {
    if (isEditing.value && eventId.value) {
      await eventStore.update(eventId.value, payload)
      notificationStore.addNotification({ message: 'Event updated successfully', type: 'success' })
      router.push(`/events/${eventId.value}`)
    } else {
      const newEvent = await eventStore.create(payload)
      if (newEvent) {
        notificationStore.addNotification({ message: 'Event created successfully', type: 'success' })
        router.push(`/events/${newEvent.documentId}`)
      }
    }
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error saving event', type: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
