<template>
  <v-container>
    <h1 class="mb-4">POIs</h1>
    <v-row>
      <v-col v-for="poi in poiStore.pois" :key="poi.id" cols="12" sm="6" md="4">
        <v-card>
          <v-img :src="poi.image" height="200px"></v-img>
          <v-card-title>{{ poi.name }}</v-card-title>
          <v-card-subtitle>{{ poi.type }}</v-card-subtitle>
          <v-card-actions>
            <v-btn color="primary" :to="`/poi/view/${poi.id}`">View</v-btn>
            <v-btn color="secondary" :to="`/poi/edit/${poi.id}`">Edit</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { usePoiStore } from '@/stores/pois'
import { onMounted } from 'vue'

const poiStore = usePoiStore()

onMounted(() => {
  poiStore.fetchPois()
})
</script>
