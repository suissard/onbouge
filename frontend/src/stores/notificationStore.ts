import { defineStore } from 'pinia';

export interface Notification {
  id: number;
  message: string;
  details?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

let nextId = 0;

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
  }),
  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
      this.notifications.push({
        ...notification,
        id: nextId++,
        timestamp: Date.now(),
      });
    },
    removeNotification(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
