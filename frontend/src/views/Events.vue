<template>
  <v-container>
    <h1 class="mb-4">Events</h1>
    <v-row>
      <v-col v-for="event in eventStore.events" :key="event.id" cols="12" sm="6" md="4">
        <Card :item="event" @click="$router.push(`/events/${event.documentId}`)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore'
import { onMounted } from 'vue'
import Card from '@/components/Card.vue'

const eventStore = useEventsStore()

onMounted(() => {
  eventStore.getList()
})
</script>
