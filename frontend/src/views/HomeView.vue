<template>
  <v-container>
    <v-row class="text-center">
      <v-col>
        <h1>Bienvenue sur SportConnect!</h1>
        <p>Le point de rencontre pour tous les passionnés de sport.</p>
        <h1 v-if="user">Bienvenue utilisateur {{ user.username }}</h1>

        <v-btn @click="notifTest">notification test</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import type { Notification } from '@/stores/notificationStore';

const notificationStore = useNotificationsStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const notifTest = () => {
  const notif:Omit<Notification, 'id' | 'timestamp'> = {
    message: "ceci est le message",
    details: 'Ceci est le detail',
    type: 'success'
  }
  notificationStore.addNotification(notif)
}

</script>
