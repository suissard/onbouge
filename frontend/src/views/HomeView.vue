<template>
  <v-container>
    <v-row class="text-center">
      <v-col>
        <h1>Bienvenue sur SportConnect!</h1>
        <p>Le point de rencontre pour tous les passionnés de sport.</p>
        <h1 v-if="authStore.user">Bienvenue utilisateur {{authStore.user.username}}</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/authStore';
  const authStore = useAuthStore();
</script>
