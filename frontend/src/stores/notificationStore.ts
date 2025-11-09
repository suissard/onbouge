import { defineStore } from 'pinia';

export interface Notification {
  id: number;
  message: string;
  details?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

let nextId = 0;

export const useNotificationsStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
  }),
  actions: {
    /**
     * Adds a new notification to the store.
     * @param {Omit<Notification, 'id' | 'timestamp'>} notification - The notification object to add.
     */
    addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
      this.notifications.push({
        ...notification,
        id: nextId++,
        timestamp: Date.now(),
      });
    },
    /**
     * Removes a notification from the store by its ID.
     * @param {number} id - The ID of the notification to remove.
     */
    removeNotification(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
