<template>
  <v-container>
    <v-card v-if="event">
      <v-img :src="event.image" height="400px"></v-img>
      <v-card-title class="text-h4">{{ event.title }}</v-card-title>
      <v-card-subtitle>{{ new Date(event.date).toLocaleString() }}</v-card-subtitle>
      <v-card-text>
        <p>{{ event.description }}</p>
        <div v-if="event.sports && event.sports.length > 0">
          <h3 class="text-h6 mt-4">Sports</h3>
          <v-chip-group>
            <v-chip v-for="sport in event.sports" :key="sport.id" :to="`/sport/view/${sport.id}`">{{ sport.title }}</v-chip>
          </v-chip-group>
        </div>
        <div v-if="event.poi">
          <h3 class="text-h6 mt-4">POI</h3>
          <v-chip :to="`/poi/view/${event.poi.id}`">{{ event.poi.title }}</v-chip>
        </div>
        <div v-if="event.profiles && event.profiles.length > 0">
          <h3 class="text-h6 mt-4">Participants</h3>
          <v-chip-group>
            <v-chip v-for="profile in event.profiles" :key="profile.id" :to="`/user/view/${profile.id}`">{{ profile.username }}</v-chip>
          </v-chip-group>
        </div>
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
