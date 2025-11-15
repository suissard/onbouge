<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Event' : 'Create Event' }}</h1>
    <v-form v-if="event" @submit.prevent="saveEvent">
      <v-text-field v-model="event.title" label="Title"></v-text-field>
      <v-textarea v-model="event.description" label="Description"></v-textarea>
      <v-text-field v-model="event.date" label="Date" type="datetime-local"></v-text-field>
      <v-text-field v-model="event.image" label="Image URL"></v-text-field>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const eventStore = useEventsStore()
const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!eventId.value)

const event = ref<any>(null)

onMounted(async () => {
  if (isEditing.value && eventId.value) {
    event.value = await eventStore.get(eventId.value);
  } else {
    event.value = { title: '', description: '', date: '', image: '' };
  }
})

/**
 * Saves the event data and navigates to the event view page.
 */
async function saveEvent() {
  if (event.value) {
    if (isEditing.value) {
      await eventStore.update(eventId.value as string, event.value);
      router.push(`/events/${eventId.value}`)
    } else {
      const newEvent = await eventStore.create(event.value);
      router.push(`/events/${newEvent.documentId}`)
    }
  }
}
</script>
