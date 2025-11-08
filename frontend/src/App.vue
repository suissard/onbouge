<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Sport Connect</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/">Home</v-btn>
      <v-btn to="/about">About</v-btn>
      <v-btn to="/events">Events</v-btn>
      <v-btn to="/pois">POIs</v-btn>
      <v-btn to="/users">Profiles</v-btn>
      <v-btn to="/sports">Sports</v-btn>
      <template v-if="!authStore.token">
        <v-btn to="/login">Login</v-btn>
        <v-btn to="/register">Register</v-btn>
      </template>
      <template v-else>
        <v-btn @click="logout">Logout</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app>
      <span>&copy; 2025</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>
