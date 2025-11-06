import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useEventStore = defineStore('events', () => {
  const events: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.list('events')
      events.value = response.data
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.get('events', id)

      // remplace dans la collection, l'entree qui correspond
      const index = events.value.findIndex(item => item.id === id)
      if (index !== -1) {
        events.value[index] = response.data
      } else {
        events.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching event (${id}):`, error)
    }
  }

  return { events, getList, get }
})
