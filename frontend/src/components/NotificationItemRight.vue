<template>
  <div
      class="notification-wrapper"
      @mouseenter="pause"
      @mouseleave="resume"
  >
    <v-snackbar
        v-model="show"
        :color="notification.type"
        :timeout="-1"
        class="ma-2"
        multi-line
    >
      <div class="d-flex justify-space-between align-center">
        <span>{{ notification.message }}</span>
        <div>
          <v-btn v-if="notification.details" icon small @click="toggleDetails">
            <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
          <v-btn icon small @click="closeNotification">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-expand-transition>
        <div v-show="expanded">
          <v-divider class="my-2"></v-divider>
          <p class="mb-0">{{ notification.details }}</p>
        </div>
      </v-expand-transition>
      <v-progress-linear
          :model-value="progress"
          color="white"
          height="4"
          absolute
          bottom
      ></v-progress-linear>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Notification } from '@/stores/notificationStore';
import { useNotificationTimer } from '@/composables/useNotificationTimer';

const props = defineProps<{
  notification: Notification;
  duration?: number;
}>();

const emit = defineEmits(['close']);

const show = ref(true);
const expanded = ref(false);

const closeNotification = () => {
  show.value = false;
  setTimeout(() => emit('close'), 300); // Allow for fade-out animation
};

const { progress, pause, resume } = useNotificationTimer(props.duration || 10000, closeNotification);

const toggleDetails = () => {
    expanded.value = !expanded.value;
    if (expanded.value) {
        pause();
    } else {
        resume();
    }
}
</script>
