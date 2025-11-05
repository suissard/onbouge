<template>
  <v-container>
    <h1>Users</h1>
    <v-list>
      <v-list-item v-for="user in userStore.users" :key="user.id">
        <v-list-item-title>{{ user.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/users'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUsers()
})
</script>
