import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

export const useEventStore = defineStore('events', () => {
  const events: Ref<any[]> = ref([])

  async function fetchEvents() {
    try {
      const response = await fetch('/data/events.json')
      const data = await response.json()
      events.value = data
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  return { events, fetchEvents }
})
