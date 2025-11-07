<template>
  <v-container>
    <h1>Login</h1>
  </v-container>
</template>

<script setup lang="ts">
  // identification mot de apsse email via l'api de strapi
  import strapi from '@/services/strapi'

  const login = async (identifier:string, password:string) => {
    
    return await strapi.login(identifier, password)
  }


</script>
