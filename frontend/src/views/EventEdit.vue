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
import { useEventStore } from '@/stores/events'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const eventStore = useEventStore()
const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)
const event = ref<any>(null)

onMounted(async () => {
  await eventStore.fetchEvents()
  event.value = { ...eventStore.events.find((e) => e.id === eventId) }
})

function saveEvent() {
  if (event.value) {
    // In a real app, you'd call an API to save the event
    console.log('Saving event:', event.value)
    router.push(`/event/view/${eventId}`)
  }
}
</script>
