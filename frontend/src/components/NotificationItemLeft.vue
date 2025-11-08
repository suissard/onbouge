<template>
  <div
    class="notification-wrapper"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <v-alert
      :type="notification.type"
      class="ma-2"
      closable
      @click:close="closeNotification"
    >
      <div class="d-flex justify-space-between align-center">
        <span>{{ notification.message }}</span>
        <v-btn v-if="notification.details" icon small @click="toggleDetails">
          <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>
      <v-expand-transition>
        <div v-show="expanded">
          <v-divider class="my-2"></v-divider>
          <p>{{ notification.details }}</p>
        </div>
      </v-expand-transition>
      <v-progress-linear
          :model-value="progress"
          color="white"
          height="4"
          absolute
          bottom
      ></v-progress-linear>
    </v-alert>
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

const expanded = ref(false);

const closeNotification = () => {
  emit('close');
};

const { progress, pause, resume } = useNotificationTimer(props.duration || 10000, closeNotification);

const toggleDetails = () => {
  expanded.value = !expanded.value;
  if (expanded.value) {
    pause();
  } else {
    resume();
  }
};
</script>
