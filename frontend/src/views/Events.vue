<template>
  <v-container>
    <h1>Events</h1>
    <v-list>
      <v-list-item v-for="event in eventStore.events" :key="event.id">
        <v-list-item-title>{{ event.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ event.date }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
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
