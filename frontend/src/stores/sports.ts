import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useSportStore = defineStore('sports', () => {
  const sports: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.collections.sports.list()
      sports.value = response.data
    } catch (error) {
      console.error('Error fetching sports:', error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.collections.sports.get(id)

      // remplace dans la collection, l'entree qui correspond
      const index = sports.value.findIndex(item => item.id === id)
      if (index !== -1) {
        sports.value[index] = response.data
      } else {
        sports.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching sport (${id}):`, error)
    }
  }

  return { sports, getList, get }
})
