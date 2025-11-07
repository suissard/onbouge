import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const strapiStoreBuilder = (dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.collections[dataName].list()
      datas.value = response.data
    } catch (error) {
      console.error(`Error fetching ${dataName}:`, error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.collections[dataName].get(id)

      // remplace dans la collection, l'entree qui correspond
      const index = datas.value.findIndex(item => item.id === id)
      if (index !== -1) {
        datas.value[index] = response.data
      } else {
        datas.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching event (${id}):`, error)
    }
  }

  const result = { getList, get }
  result[dataName] = datas

  return result
})
}

export const useEventsStore = strapiStoreBuilder("events")
export const usePoisStore = strapiStoreBuilder("pois")
export const useProfilesStore = strapiStoreBuilder("profiles")
export const useSportsStore = strapiStoreBuilder("sports")
export const useUsersStore = strapiStoreBuilder("users")