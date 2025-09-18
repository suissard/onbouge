import { defineStore } from 'pinia';
import strapi from '@/strapi';
import { ref } from 'vue';

export const useEventsStore = defineStore('events', () => {
  const events = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchEvents() {
    isLoading.value = true;
    error.value = null;
    try {
      // Based on the old API client, the response for a collection
      // is an object with a 'data' property containing the array.
      const response = await strapi.get('events');
      events.value = response.data;
    } catch (e) {
      error.value = 'Failed to fetch events.';
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  return { events, isLoading, error, fetchEvents };
});
