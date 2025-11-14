<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Sport' : 'Create Sport' }}</h1>
    <v-form v-if="sport" @submit.prevent="saveSport">
      <v-text-field v-model="sport.name" label="Name"></v-text-field>
      <v-textarea v-model="sport.description" label="Description"></v-textarea>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading sport...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore } from '@/stores/strapiStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const sportStore = useSportsStore()
const route = useRoute()
const router = useRouter()
const sportId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!sportId.value)

const sport = ref<any>(null)

onMounted(async () => {
  if (isEditing.value && sportId.value) {
    sport.value = await sportStore.get(sportId.value);
  } else {
    sport.value = { name: '', description: '' };
  }
})

/**
 * Saves the sport data and navigates to the sport view page.
 */
function saveSport() {
  if (sport.value) {
    // In a real app, you'd call an API to save the sport
    console.log('Saving sport:', sport.value)
    if (isEditing.value) {
      router.push(`/sports/${sportId.value}`)
    } else {
      // This is a placeholder for the creation logic
      // After creation, you would typically navigate to the new sport's page
      router.push(`/sports`)
    }
  }
}
</script>
