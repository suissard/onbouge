<template>
  <v-container>
    <h1 class="mb-4">Edit User</h1>
    <DynamicUpdateForm v-if="user" :initial-data="user" :model-class="User" :data-sources="{ profiles: profilesList }"
      title="Edit User" @save="saveUser" />
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore, useProfilesStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User } from '@/interfaces/user'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'

const userStore = useUsersStore()
const profilesStore = useProfilesStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
// In previous code userId was number, but strapiStore uses documentId (string) now.
// Assuming route param is documentId.
const userId = computed(() => route.params.id ? String(route.params.id) : null)

const user = ref<Partial<User> | null>(null)
const loading = ref(false)

const profilesList = computed(() => profilesStore.datas)

const rules = {
  required: (value: any) => !!value || 'Required.',
  email: (value: any) => /.+@.+\..+/.test(value) || 'E-mail must be valid.',
}

onMounted(async () => {
  await profilesStore.getList()

  if (userId.value) {
    const fetchedUser = await userStore.get(userId.value)
    if (fetchedUser) {
      user.value = { ...fetchedUser }
    } else {
      notificationStore.addNotification({ message: 'User not found', type: 'error' })
      router.push('/users')
    }
  } else {
    notificationStore.addNotification({ message: 'Invalid User ID', type: 'error' })
    router.push('/users')
  }
})

/**
 * Saves the user data and navigates to the user view page.
 */
async function saveUser(formData: any) {
  if (!user.value || !userId.value) return

  loading.value = true

  try {
    await userStore.update(userId.value, formData)
    notificationStore.addNotification({ message: 'User updated successfully', type: 'success' })
    router.push(`/users/${userId.value}`)
  } catch (error) {
    console.error(error)
    notificationStore.addNotification({ message: 'Error saving user', type: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
