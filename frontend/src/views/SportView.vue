<template>
  <v-container>
    <v-card v-if="sport">
      <v-card-title class="text-h4">{{ sport.title }}</v-card-title>
      <v-card-text>
        <p>{{ sport.description }}</p>
        <h3 class="text-h6 mt-4">Events</h3>

        <v-chip-group>
          <v-chip v-for="event in sport.events" :key="event.id" :to="`/event/view/${event.id}`">{{ event.title
            }}</v-chip>
        </v-chip-group>
        <h3 class="text-h6 mt-4">Pois</h3>

        <v-chip-group>
          <v-chip v-for="poi in sport.pois" :key="poi.id" :to="`/event/view/${poi.id}`">{{ poi.title
            }}</v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading sport...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useSportStore } from '@/stores/sports'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const sportStore = useSportStore()
const route = useRoute()
const sportId = Number(route.params.id)
const sport = ref<any>(null)

onMounted(async () => {
  await sportStore.getList()
  sport.value = sportStore.sports.find((s) => s.id === sportId)
})
</script>
