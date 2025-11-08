<template>
  <div class="notification-container right">
    <transition-group name="slide-fade" tag="div">
      <NotificationItemRight
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @close="removeNotification(notification.id)"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';
import NotificationItemRight from './NotificationItemRight.vue';

const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const { removeNotification } = notificationStore;
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 16px;
  width: 350px;
  z-index: 9999;
}

.right {
  right: 16px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
