import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const usePoiStore = defineStore('pois', () => {
  const pois: Ref<any[]> = ref([])

  async function fetchPois() {
    try {
      const { data } = await strapi.find('pois')
      pois.value = data
    } catch (error) {
      console.error('Error fetching pois:', error)
    }
  }

  return { pois, fetchPois }
})
