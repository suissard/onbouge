<template>
  <v-container>
    <h1 class="mb-4">Edit User</h1>
    <v-form v-if="user" @submit.prevent="saveUser">
      <v-text-field v-model="user.username" label="Username"></v-text-field>
      <v-text-field v-model="user.name" label="Name"></v-text-field>
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

const userStore = useUsersStore()
const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)
const user = ref<any>(null)

onMounted(async () => {
  await userStore.getList()
  user.value = { ...userStore.users.find((u) => u.id === userId) }
})

function saveUser() {
  if (user.value) {
    // In a real app, you'd call an API to save the user
    console.log('Saving user:', user.value)
    router.push(`/users/${userId}`)
  }
}
</script>
