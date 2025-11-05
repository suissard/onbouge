import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

export const usePoiStore = defineStore('pois', () => {
  const pois: Ref<any[]> = ref([])

  async function fetchPois() {
    try {
      const response = await fetch('/data/pois.json')
      const data = await response.json()
      pois.value = data
    } catch (error) {
      console.error('Error fetching pois:', error)
    }
  }

  return { pois, fetchPois }
})
