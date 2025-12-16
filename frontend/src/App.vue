<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Sport Connect</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" color="primary">Home</v-btn>
      <v-btn to="/about" color="primary">About</v-btn>
      <v-btn to="/demonstration-vue" color="primary">Vue Demo</v-btn>
      <v-btn to="/events" color="primary">Events</v-btn>
      <v-btn to="/pois" color="primary">POIs</v-btn>
      <v-btn to="/profiles" color="primary">Profiles</v-btn>
      <v-btn to="/activities" color="primary">Activités</v-btn>
      <v-btn to="/spatial-test" color="primary">Spatial Test</v-btn>
      <template v-if="!authStore.user">
        <v-btn to="/login" color="secondary">Login</v-btn>
        <v-btn to="/register" color="secondary">Register</v-btn>
      </template>
      <template v-else>
        <v-menu min-width="200px" rounded>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <ProfileAvatar v-if="authStore.user" :username="authStore.user.username"
                :document-id="authStore.user.profile?.documentId || authStore.user.username"
                :photo="authStore.user.profile?.photo" :size="40" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-list-item-media>
                  <ProfileAvatar v-if="authStore.user" :username="authStore.user.username"
                    :document-id="authStore.user.profile?.documentId || authStore.user.username"
                    :photo="authStore.user.profile?.photo" :size="32" class="mr-2" />
                </v-list-item-media>
              </template>
              <v-list-item-title>{{ authStore.user?.username }}</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <template v-if="authStore.user?.profile">
              <v-list-item :to="`/profiles/${authStore.user.profile.documentId}`">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account"></v-icon>
                </template>
                <v-list-item-title>Voir mon profil</v-list-item-title>
              </v-list-item>
              <v-list-item :to="`/profiles/${authStore.user.profile.documentId}/edit`">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-edit"></v-icon>
                </template>
                <v-list-item-title>Éditer mon profil</v-list-item-title>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
            </template>
            <template v-else>
              <v-list-item disabled>
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-alert"></v-icon>
                </template>
                <v-list-item-title>Profil introuvable</v-list-item-title>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
            </template>
            <v-list-item @click="logout" color="error">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout"></v-icon>
              </template>
              <v-list-item-title>Se déconnecter</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="main-container">
        <router-view></router-view>
      </v-container>
    </v-main>

    <NotificationsOverlay />

    <v-btn icon="mdi-cog" class="settings-fab" @click="settingsPanelVisible = !settingsPanelVisible"></v-btn>

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
import ProfileAvatar from '@/components/ProfileAvatar.vue';
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
  bottom: 55px;
  left: 16px;
  z-index: 1000;
}
</style>
