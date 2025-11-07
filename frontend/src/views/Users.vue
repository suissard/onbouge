<template>
  <v-container>
    <h1 class="mb-4">Users</h1>
    <v-row>
      <v-col v-for="user in userStore.users" :key="user.id" cols="12" sm="6" md="4">
        <Card :item="user" @click="$router.push(`/users/${user.id}`)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/strapiStore'
import { onMounted } from 'vue'
import Card from '@/components/Card.vue'

const userStore = useUsersStore()

onMounted(() => {
  userStore.getList()
})
</script>
