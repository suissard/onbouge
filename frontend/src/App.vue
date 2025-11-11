<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Sport Connect</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/">Home</v-btn>
      <v-btn to="/test">Test</v-btn>
      <v-btn to="/about">About</v-btn>
      <v-btn to="/demonstration-vue">Vue Demo</v-btn>
      <v-btn to="/events">Events</v-btn>
      <v-btn to="/pois">POIs</v-btn>
      <v-btn to="/users">Profiles</v-btn>
      <v-btn to="/sports">Sports</v-btn>
      <template v-if="!authStore.user">
        <v-btn to="/login">Login</v-btn>
        <v-btn to="/register">Register</v-btn>
      </template>
      <template v-else>
        <v-btn @click="logout">Logout</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="main-container">
        <router-view></router-view>
      </v-container>
    </v-main>

    <NotificationsOverlay />

    <v-btn
      icon="mdi-cog"
      class="settings-fab"
      @click="settingsPanelVisible = !settingsPanelVisible"
    ></v-btn>

    <SettingsPanel v-model="settingsPanelVisible" />

    <v-footer app>
      <span>&copy; 2025</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import NotificationsOverlay from '@/components/NotificationsOverlay.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';
import { useSettingsStore } from './stores/settingsStore';

const authStore = useAuthStore();
const router = useRouter();
const settingsPanelVisible = ref(false);
const settingsStore = useSettingsStore();
const theme = useTheme();

watch(() => settingsStore.theme, (newTheme) => {
  theme.global.name.value = newTheme;
});

watch(() => settingsStore.colors, (newColors) => {
  if (newColors.primary) {
    theme.themes.value.light.colors.primary = newColors.primary;
    theme.themes.value.dark.colors.primary = newColors.primary;
  }
  if (newColors.secondary) {
    theme.themes.value.light.colors.secondary = newColors.secondary;
    theme.themes.value.dark.colors.secondary = newColors.secondary;
  }
}, { deep: true });

/**
 * Logs the user out by calling the auth store's logout action and redirects to the homepage.
 */
const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.main-container {
  width: 80%;
  margin: 0 auto;
}

.settings-fab {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 1000;
}
</style>
