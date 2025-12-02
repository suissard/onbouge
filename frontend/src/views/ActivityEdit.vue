<template>
  <v-container>
    <h1 class="mb-4">{{ isEditing ? 'Edit Activity' : 'Create Activity' }}</h1>
    <DynamicUpdateForm v-if="activity" :initial-data="activity" :model-class="Activity"
      :data-sources="{ pois: poisList, events: eventsList }" :title="isEditing ? 'Edit Activity' : 'Create Activity'"
      @save="saveActivity" @delete="deleteActivity" />
    <v-alert v-else-if="isEditing" type="info">Loading activity...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useActivitiesStore, usePoisStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Activity } from '@/interfaces/activity'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const activityStore = useActivitiesStore()
const poisStore = usePoisStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const activityId = computed(() => route.params.id ? String(route.params.id) : null)
const isEditing = computed(() => !!activityId.value)

const activity = ref<Partial<Activity> | null>(null)
const loading = ref(false)

const poisList = computed(() => poisStore.datas)
const eventsList = computed(() => eventsStore.datas)

const strapiObject = new StrapiObject<Activity>(
  activityStore,
  notificationStore,
  router,
  'activities',
  'Activity'
)

onMounted(async () => {
  await Promise.all([
    poisStore.getList(),
    eventsStore.getList()
  ])

  if (isEditing.value && activityId.value) {
    const fetchedActivity = await strapiObject.load(activityId.value);
    if (fetchedActivity) {
      activity.value = { ...fetchedActivity };
      // @ts-ignore
      if (fetchedActivity.pois) activity.value.pois = fetchedActivity.pois.map((p: any) => p.documentId)
      // @ts-ignore
      if (fetchedActivity.events) activity.value.events = fetchedActivity.events.map((e: any) => e.documentId)
    }
  } else {
    // @ts-ignore
    activity.value = {}; // Initialize as empty object or new Activity() if class structure allows
  }
})

/**
 * Saves the activity data and navigates to the activity view page.
 */
async function saveActivity(formData: any) {
  if (!activity.value) return

  loading.value = true

  try {
    const payload = { ...formData };
    await strapiObject.save(payload, activityId.value || undefined);
  } finally {
    loading.value = false
  }
}

async function deleteActivity(formData: any) {
  if (!activityId.value) return

  loading.value = true
  try {
    await strapiObject.delete(activityId.value)
  } finally {
    loading.value = false
  }
}
</script>
