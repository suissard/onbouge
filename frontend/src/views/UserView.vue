<template>
  <v-container>
    <v-card v-if="user">
      <v-card-title class="text-h4">{{ user.username }}</v-card-title>
      <v-card-subtitle>{{ user.email }}</v-card-subtitle>
      <v-card-text>
        <p><strong>Name:</strong> {{ user.name }}</p>
      </v-card-text>
    </v-card>
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/users'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const userId = Number(route.params.id)
const user = ref<any>(null)

onMounted(async () => {
  await userStore.fetchUsers()
  user.value = userStore.users.find((u) => u.id === userId)
})
</script>
