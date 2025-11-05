<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Sport Connect</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/">Home</v-btn>
      <v-btn to="/about">About</v-btn>
      <v-btn to="/events">Events</v-btn>
      <v-btn to="/pois">POIs</v-btn>
      <v-btn to="/forum">Forum</v-btn>
      <v-btn to="/users">Users</v-btn>
      <v-btn to="/login">Login</v-btn>
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
  //
</script>
