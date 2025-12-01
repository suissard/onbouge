<template>
  <v-container>
    <v-card v-if="event">
      <v-img :src="event.image" height="400px"></v-img>
      <v-card-title class="text-h4 d-flex justify-space-between align-center">
        <span>{{ event.title }}</span>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-pencil" variant="tonal" color="primary" :to="`/events/${eventId}/edit`"
              :disabled="!authStore.canEdit(event)" v-bind="props"></v-btn>
          </template>
          <span>{{ authStore.canEdit(event) ? 'Éditer' : 'Vous n\'avez pas la permission d\'éditer' }}</span>
        </v-tooltip>
      </v-card-title>
      <v-card-subtitle>{{ new Date(event.date).toLocaleString() }}</v-card-subtitle>
      <v-card-text>
        <p>{{ event.description }}</p>
        <div v-if="event.sports && event.sports.length > 0">
          <h3 class="text-h6 mt-4">Sports</h3>
          <v-chip-group>
            <v-chip v-for="sport in event.sports" :key="sport.id" :to="`/sports/${sport.documentId}`">{{ sport.title
            }}</v-chip>
          </v-chip-group>
        </div>
        <div v-if="event.poi">
          <h3 class="text-h6 mt-4">POI</h3>
          <v-chip :to="`/pois/${event.poi.documentId}`">{{ event.poi.title }}</v-chip>
        </div>
        <div v-if="event.profiles && event.profiles.length > 0">
          <h3 class="text-h6 mt-4">Participants</h3>
          <v-chip-group>
            <v-chip v-for="profile in event.profiles" :key="profile.id" :to="`/profiles/${profile.documentId}`">{{
              profile.username }}</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading event...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const eventStore = useEventsStore()
const authStore = useAuthStore();
const route = useRoute()
const eventId = String(route.params.id)
const event = ref<any>(null)

onMounted(async () => {
  event.value = await eventStore.get(eventId)
})

</script>
