<template>
  <v-container>
    <v-card v-if="event">
      <v-img :src="event.image" height="400px"></v-img>
      <v-card-title class="text-h4">{{ event.title }}</v-card-title>
      <v-card-subtitle>{{ new Date(event.date).toLocaleString() }}</v-card-subtitle>
      <v-card-text>
        <p>{{ event.description }}</p>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventStore } from '@/stores/events'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const eventStore = useEventStore()
const route = useRoute()
const eventId = Number(route.params.id)
const event = ref<any>(null)

onMounted(async () => {
  await eventStore.fetchEvents()
  event.value = eventStore.events.find((e) => e.id === eventId)
})
</script>
