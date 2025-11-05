import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useEventStore = defineStore('events', () => {
  const events: Ref<any[]> = ref([])

  async function fetchEvents() {
    try {
      const response = await strapi.find('events')
      events.value = response.data
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  return { events, fetchEvents }
})
