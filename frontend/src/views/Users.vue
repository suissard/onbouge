<template>
  <v-container>
    <h1 class="mb-4">Users</h1>
    <v-row>
      <v-col v-for="user in userStore.users" :key="user.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>{{ user.username }}</v-card-title>
          <v-card-subtitle>{{ user.email }}</v-card-subtitle>
          <v-card-actions>
            <v-btn color="primary" :to="`/user/view/${user.id}`">View</v-btn>
            <v-btn color="secondary" :to="`/user/edit/${user.id}`">Edit</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
