import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useSportStore = defineStore('sports', () => {
  const sports: Ref<any[]> = ref([])

  async function fetchSports() {
    try {
      const response = await strapi.find('sports')
      sports.value = response.data
    } catch (error) {
      console.error('Error fetching sports:', error)
    }
  }

  return { sports, fetchSports }
})
