<template>
  <v-container>
    <v-card v-if="activity">
      <v-card-title class="text-h4 d-flex justify-space-between align-center">
        <span>{{ activity.title }}</span>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-pencil" variant="tonal" color="primary" :to="`/activities/${activityId}/edit`"
              :disabled="!authStore.canEdit(activity)" v-bind="props"></v-btn>
          </template>
          <span>{{ authStore.canEdit(activity) ? 'Éditer' : 'Vous n\'avez pas la permission d\'éditer' }}</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <p>{{ activity.description }}</p>
        <h3 class="text-h6 mt-4">Events</h3>

        <v-chip-group>
          <v-chip v-for="event in activity.events" :key="event.id" :to="`/events/${event.documentId}`">{{ event.title
            }}</v-chip>
        </v-chip-group>
        <h3 class="text-h6 mt-4">Pois</h3>

        <v-chip-group>
          <v-chip v-for="poi in activity.pois" :key="poi.id" :to="`/pois/${poi.documentId}`">{{ poi.title
            }}</v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading activity...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '@/stores/strapiStore'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const activityStore = useActivitiesStore()
const authStore = useAuthStore();
const route = useRoute()
const activityId = String(route.params.id)
const activity = ref<any>(null)

onMounted(async () => {
  activity.value = await activityStore.get(activityId)
})

</script>
