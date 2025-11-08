<template>
  <v-container>
    <h1 class="mb-4">POIs</h1>
    <v-row>
      <v-col v-for="poi in poiStore.pois" :key="poi.id" cols="12" sm="6" md="4">
        <Card :item="poi" @click="$router.push(`/pois/${poi.documentId}`)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore } from '@/stores/strapiStore'
import { onMounted } from 'vue'
import Card from '@/components/Card.vue'

const poiStore = usePoisStore()

onMounted(() => {
  poiStore.getList()
})
</script>
