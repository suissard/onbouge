<template>
  <v-card @click="$emit('click')">
    <v-img :src="item.image" height="200px" v-if="item.image"></v-img>
    <v-card-title>{{ item.title || item.username }}</v-card-title>
    <v-card-subtitle v-if="!expanded && item.description">{{ item.description.substring(0, 100) }}...</v-card-subtitle>
    <v-card-text v-if="expanded">
      <p>{{ item.description }}</p>
    </v-card-text>
    <v-card-actions>
      <v-btn icon @click.stop="expanded = !expanded" class="bg-red">
        <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  item: {
    id: number
    title?: string
    username?: string
    description: string
    image?: string
  }
}>()

const expanded = ref(false)
</script>
