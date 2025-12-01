<template>
  <v-container>
    <v-card v-if="sport">
      <v-card-title class="text-h4 d-flex justify-space-between align-center">
        <span>{{ sport.name }}</span>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-pencil" variant="tonal" color="primary" :to="`/sports/${sportId}/edit`"
              :disabled="!authStore.canEdit(sport)" v-bind="props"></v-btn>
          </template>
          <span>{{ authStore.canEdit(sport) ? 'Éditer' : 'Vous n\'avez pas la permission d\'éditer' }}</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <p>{{ sport.description }}</p>
        <h3 class="text-h6 mt-4">Events</h3>

        <v-chip-group>
          <v-chip v-for="event in sport.events" :key="event.id" :to="`/events/${event.documentId}`">{{ event.title
          }}</v-chip>
        </v-chip-group>
        <h3 class="text-h6 mt-4">Pois</h3>

        <v-chip-group>
          <v-chip v-for="poi in sport.pois" :key="poi.id" :to="`/pois/${poi.documentId}`">{{ poi.title
          }}</v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading sport...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore } from '@/stores/strapiStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const sportStore = useSportsStore()
const authStore = useAuthStore();
const route = useRoute()
const sportId = String(route.params.id)
const sport = ref<any>(null)

onMounted(async () => {
  sport.value = await sportStore.get(sportId)
})

</script>
