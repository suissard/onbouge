<template>
  <v-container>
    <h1>Register</h1>
  </v-container>
</template>

<script setup lang="ts">
  import strapi from '@/services/strapi'

  const register = async (username:string, email:string, password:string) => {
    return await strapi.register(username, email, password)
  }
</script>
