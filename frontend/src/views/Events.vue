<template>
  <v-container>
    <h1 class="mb-4">Events</h1>
    <v-row>
      <v-col v-for="event in eventStore.events" :key="event.id" cols="12" sm="6" md="4">
        <v-card>
          <v-img :src="event.image" height="200px"></v-img>
          <v-card-title>{{ event.title }}</v-card-title>
          <v-card-subtitle>{{ new Date(event.date).toLocaleDateString() }}</v-card-subtitle>
          <v-card-actions>
            <v-btn color="primary" :to="`/event/view/${event.id}`">View</v-btn>
            <v-btn color="secondary" :to="`/event/edit/${event.id}`">Edit</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useEventStore } from '@/stores/events'
import { onMounted } from 'vue'

const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
})
</script>
