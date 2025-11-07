import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const usePoiStore = defineStore('pois', () => {
  const pois: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.collections.pois.list()
      pois.value = response.data
    } catch (error) {
      console.error('Error fetching pois:', error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.collections.pois.get(id)

      // remplace dans la collection, l'entree qui correspond
      const index = pois.value.findIndex(item => item.id === id)
      if (index !== -1) {
        pois.value[index] = response.data
      } else {
        pois.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching poi (${id}):`, error)
    }
  }

  return { pois, getList, get }
})
