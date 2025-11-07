import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useProfilesStore = defineStore('profiles', () => {
  const profiles: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.collections.profiles.list()
      profiles.value = response.data
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.collections.profiles.get(id)

      // remplace dans la collection, l'entree qui correspond
      const index = profiles.value.findIndex(item => item.id === id)
      if (index !== -1) {
        profiles.value[index] = response.data
      } else {
        profiles.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching profiles (${id}):`, error)
    }
  }

  return { profiles, getList, get }
})
