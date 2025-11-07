<template>
  <v-container>
    <v-card v-if="poi">
      <v-img :src="poi.image" height="400px"></v-img>
      <v-card-title class="text-h4">{{ poi.title }}</v-card-title>
      <v-card-text>
        <p>{{ poi.description }}</p>
        <a :href="poi.gmaps_url" target="_blank">View on Google Maps</a>
        <div v-if="poi.sports && poi.sports.length > 0">
          <h3 class="text-h6 mt-4">Sports</h3>
          <v-chip-group>
            <v-chip v-for="sport in poi.sports" :key="sport.id" :to="`/sport/view/${sport.id}`">{{ sport.title
              }}</v-chip>
          </v-chip-group>
        </div>
        <div v-if="poi.events && poi.events.length > 0">
          <h3 class="text-h6 mt-4">Events</h3>
          <v-chip-group>
            <v-chip v-for="event in poi.events" :key="event.id" :to="`/event/view/${event.id}`">{{ event.title
              }}</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading POI...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore } from '@/stores/strapiStore'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const poiStore = usePoisStore()
const route = useRoute()
const poiId = Number(route.params.id)
const poi = ref<any>(null)

onMounted(async () => {
  await poiStore.getList()
  poi.value = poiStore.pois.find((p) => p.id === poiId)
})
</script>
