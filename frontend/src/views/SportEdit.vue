<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Sport' : 'Create Sport' }}</h1>
    <v-form v-if="sport" ref="form" @submit.prevent="saveSport">
      <v-text-field
        v-model="sport.title"
        label="Title"
        :rules="[rules.required]"
        required
      ></v-text-field>

      <v-textarea
        v-model="sport.description"
        label="Description"
        :rules="[rules.required]"
        required
      ></v-textarea>

      <v-btn type="submit" color="primary" :loading="loading">Save</v-btn>
    </v-form>
    <v-alert v-else-if="isEditing" type="info">Loading sport...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Sport } from '@/interfaces/sport'

const sportStore = useSportsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const sportId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!sportId.value)

const sport = ref<Partial<Sport> | null>(null)
const loading = ref(false)

const rules = {
  required: (value: any) => !!value || 'Required.',
}

onMounted(async () => {
  if (isEditing.value && sportId.value) {
    const fetchedSport = await sportStore.get(sportId.value);
    if (fetchedSport) {
        sport.value = { ...fetchedSport };
    } else {
        notificationStore.addNotification({ message: 'Sport not found', type: 'error' })
        router.push('/sports')
    }
  } else {
    sport.value = { title: '', description: '' };
  }
})

/**
 * Saves the sport data and navigates to the sport view page.
 */
async function saveSport() {
  if (!sport.value) return

  loading.value = true

  try {
    if (isEditing.value && sportId.value) {
      await sportStore.update(sportId.value, sport.value);
      notificationStore.addNotification({ message: 'Sport updated successfully', type: 'success' })
      router.push(`/sports/${sportId.value}`)
    } else {
      const newSport = await sportStore.create(sport.value);
      if (newSport) {
        notificationStore.addNotification({ message: 'Sport created successfully', type: 'success' })
        router.push(`/sports/${newSport.documentId}`)
      }
    }
  } catch (error) {
      console.error(error)
      notificationStore.addNotification({ message: 'Error saving sport', type: 'error' })
  } finally {
      loading.value = false
  }
}
</script>
