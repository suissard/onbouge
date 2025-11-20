<template>
  <v-container>
    <h1 class="mb-4">Edit User</h1>
    <v-form v-if="user" ref="form" @submit.prevent="saveUser">
      <v-text-field
        v-model="user.username"
        label="Username"
        :rules="[rules.required]"
        required
      ></v-text-field>

      <v-text-field
        v-model="user.email"
        label="Email"
        type="email"
        :rules="[rules.required, rules.email]"
        required
      ></v-text-field>

      <v-checkbox
        v-model="user.confirmed"
        label="Confirmed"
      ></v-checkbox>

      <v-checkbox
        v-model="user.blocked"
        label="Blocked"
      ></v-checkbox>

      <v-btn type="submit" color="primary" :loading="loading">Save</v-btn>
    </v-form>
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { User } from '@/interfaces/user'

const userStore = useUsersStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
// In previous code userId was number, but strapiStore uses documentId (string) now.
// Assuming route param is documentId.
const userId = computed(() => route.params.id ? String(route.params.id) : null)

const user = ref<Partial<User> | null>(null)
const loading = ref(false)

const rules = {
  required: (value: any) => !!value || 'Required.',
  email: (value: any) => /.+@.+\..+/.test(value) || 'E-mail must be valid.',
}

onMounted(async () => {
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
async function saveUser() {
  if (!user.value || !userId.value) return

  loading.value = true

  try {
    await userStore.update(userId.value, user.value)
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
