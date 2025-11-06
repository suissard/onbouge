<template>
  <v-container>
    <h1 class="mb-4">Sports</h1>
    <v-row>
      <v-col v-for="sport in sportStore.sports" :key="sport.id" cols="12" sm="6" md="4">
        <Card :item="sport" @click="$router.push(`/sport/view/${sport.id}`)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useSportStore } from '@/stores/sports'
import { onMounted } from 'vue'
import Card from '@/components/Card.vue'

const sportStore = useSportStore()

onMounted(() => {
  sportStore.getList()
})
</script>
