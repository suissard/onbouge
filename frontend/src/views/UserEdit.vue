<template>
  <v-container>
    <h1 class="mb-4">Edit User</h1>
    <v-form v-if="user" @submit.prevent="saveUser">
      <v-text-field v-model="user.username" label="Username"></v-text-field>
      <v-text-field v-model="user.email" label="Email" type="email"></v-text-field>
      <v-btn type="submit" color="primary">Save</v-btn>
    </v-form>
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/strapiStore'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { User } from '@/interfaces/user'

const userStore = useUsersStore()
const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)
const user = ref<User | null>(null)

onMounted(async () => {
  await userStore.getList()
  const foundUser = userStore.datas.value.find((u: User) => u.id === userId)
  if (foundUser) {
    user.value = { ...foundUser }
  }
})

/**
 * Saves the user data and navigates to the user view page.
 * In a real app, this would call an API to save the user.
 */
function saveUser() {
  if (user.value) {
    // In a real app, you'd call an API to save the user
    console.log('Saving user:', user.value)
    router.push(`/users/${userId}`)
  }
}
</script>
