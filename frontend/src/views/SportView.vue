<template>
  <v-container>
    <v-card v-if="sport">
      <v-card-title class="text-h4">{{ sport.title }}</v-card-title>
      <v-card-text>
        <p>{{ sport.description }}</p>
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
  await sportStore.fetchSports()
  sport.value = sportStore.sports.find((s) => s.id === sportId)
})
</script>
