import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'
import type { StrapiObject } from 'suissard-strapi-client'
import type { Event } from '@/interfaces/event'
import type { Poi } from '@/interfaces/poi'
import type { Profile } from '@/interfaces/profile'
import type { Sport } from '@/interfaces/sport'
import type { User } from '@/interfaces/user'

/**
 * A factory function to create a Pinia store for a specific Strapi collection.
 * @param {string} dataName - The name of the Strapi collection (e.g., "events", "pois").
 * @returns A Pinia store definition.
 */
export const strapiStoreBuilder = <T extends StrapiObject>(dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<T[]> = ref([])

  /**
   * Fetches a list of items from the Strapi collection and populates the store.
   */
  async function getList() {
    try {
      const response = await strapi.get(dataName+"?populate=*")
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
      const response = await strapi.get(`${dataName}/${id}?populate=*`)

      // remplace dans la collection, l'entree qui correspond
      const index = datas.value.findIndex(item => item.documentId === id)
      if (index !== -1) {
        datas.value[index] = response.data
      } else {
        datas.value.push(response.data)
      }

      return datas.value.find(item => item.documentId === id)
      // return datas.value[index] response.data
    } catch (error) {
      console.error(`Error fetching event (${id}):`, error)
    }
  }

  const result = {
    getList,
    get,
    datas,
    [dataName]: datas,
  }

  return result as typeof result & { [key: string]: Ref<T[]> }
})
}

export const useEventsStore = strapiStoreBuilder<Event>("events")
export const usePoisStore = strapiStoreBuilder<Poi>("pois")
export const useProfilesStore = strapiStoreBuilder<Profile>("profiles")
export const useSportsStore = strapiStoreBuilder<Sport>("sports")
export const useUsersStore = strapiStoreBuilder<User>("users")