import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

/**
 * A factory function to create a Pinia store for a specific Strapi collection.
 * @param {string} dataName - The name of the Strapi collection (e.g., "events", "pois").
 * @returns A Pinia store definition.
 */
export const strapiStoreBuilder = (dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<any[]> = ref([])

  /**
   * Fetches a list of items from the Strapi collection and populates the store.
   */
  async function getList() {
    try {
      const response = await strapi.get(dataName+"?populate=*", true)
      // console.log("strapiStore.getList()", response.data?.data || response.data)
      datas.value = response.data?.data || response.data
    } catch (error) {
      console.error(`Error fetching ${dataName}:`, error)
    }
  }

  /**
   * Fetches a single item by its ID from the Strapi collection.
   * If the item is already in the store, it's updated. Otherwise, it's added to the store.
   * @param {string} id - The ID of the item to fetch.
   * @returns {Promise<any | undefined>} A promise that resolves to the fetched item, or undefined if an error occurs.
   */
    async function get(id: string) {
    try {
      const response = await strapi.get(`${dataName}/${id}?populate=*`, true)

      console.log("strapiStore.get(id)", id, response.data.data)

      // remplace dans la collection, l'entree qui correspond
      const index = datas.value.findIndex(item => item.documentId === id)
      if (index !== -1) {
        datas.value[index] = response.data?.data
      } else {
        datas.value.push(response.data?.data)
      }

      console.log(datas.value.find(item => item.documentId === id))
      return datas.value.find(item => item.documentId === id)
      // return datas.value[index] response.data
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