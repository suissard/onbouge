<template>
  <v-container>
    <v-card v-if="poi">
      <v-img :src="poi.image" height="400px"></v-img>
      <v-card-title class="text-h4 d-flex justify-space-between align-center">
        <span>{{ poi.title }}</span>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-pencil" variant="tonal" color="primary" :to="`/pois/${poiId}/edit`"
              :disabled="!authStore.canEdit(poi)" v-bind="props"></v-btn>
          </template>
          <span>{{ authStore.canEdit(poi) ? 'Éditer' : 'Vous n\'avez pas la permission d\'éditer' }}</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <p>{{ poi.description }}</p>
        <a :href="poi.gmaps_url" target="_blank">View on Google Maps</a>
        <div v-if="poi.sports && poi.sports.length > 0">
          <h3 class="text-h6 mt-4">Sports</h3>
          <v-chip-group>
            <v-chip v-for="sport in poi.sports" :key="sport.id" :to="`/sports/${sport.documentId}`">{{ sport.title
            }}</v-chip>
          </v-chip-group>
        </div>
        <div v-if="poi.events && poi.events.length > 0">
          <h3 class="text-h6 mt-4">Events</h3>
          <v-chip-group>
            <v-chip v-for="event in poi.events" :key="event.id" :to="`/events/${event.documentId}`">{{ event.title
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const poiStore = usePoisStore()
const authStore = useAuthStore();
const route = useRoute()
const poiId = String(route.params.id)
const poi = ref<any>(null)

onMounted(async () => {
  poi.value = await poiStore.get(poiId)
})

</script>
