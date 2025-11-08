<template>
  <v-container>
    <v-card v-if="user">
      <v-card-title class="text-h4">{{ user.username }}</v-card-title>
      <v-card-text>
        <p>{{ user.description }}</p>
        <p>{{ user.email }}</p>
        <div v-if="user.sports && user.sports.length > 0">
          <h3 class="text-h6 mt-4">Sports</h3>
          <v-chip-group>
            <v-chip v-for="sport in user.sports" :key="sport.id" :to="`/sports/${sport.documentId}`">{{ sport.title
              }}</v-chip>
          </v-chip-group>
        </div>
        <div v-if="user.events && user.events.length > 0">
          <h3 class="text-h6 mt-4">Events</h3>
          <v-chip-group>
            <v-chip v-for="event in user.events" :key="event.id" :to="`/events/${event.documentId}`">{{ event.title
              }}</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/strapiStore'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUsersStore()
const route = useRoute()
const userId = String(route.params.id)
const user = ref<any>(null)

onMounted(async () => {
  user.value = await userStore.get(userId)
})
</script>
