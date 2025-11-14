<template>
  <v-container>
    <h1 class="mb-4">Edit Event</h1>
    <v-form v-if="event" @submit.prevent="saveEvent">
      <v-text-field v-model="event.title" label="Title"></v-text-field>
      <v-textarea v-model="event.description" label="Description"></v-textarea>
      <v-text-field v-model="event.date" label="Date" type="datetime-local"></v-text-field>
      <v-text-field v-model="event.image" label="Image URL"></v-text-field>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const eventStore = useEventsStore()
const route = useRoute()
const router = useRouter()
const eventId = String(route.params.id)
const event = ref<any>(null)

onMounted(async () => {
  event.value = await eventStore.get(eventId);
})

/**
 * Saves the event data and navigates to the event view page.
 * In a real app, this would call an API to save the event.
 */
function saveEvent() {
  if (event.value) {
    // In a real app, you'd call an API to save the event
    console.log('Saving event:', event.value)
    router.push(`/events/${eventId}`)
  }
}
</script>
