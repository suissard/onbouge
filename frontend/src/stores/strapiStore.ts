import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'
import type { Event } from '@/interfaces/event'
import type { Poi } from '@/interfaces/poi'
import type { Profile } from '@/interfaces/profile'
import type { Sport } from '@/interfaces/sport'
import type { User } from '@/interfaces/user'

// Define a base interface for objects that have a documentId
interface HasDocumentId {
  documentId: string;
}

/**
 * A factory function to create a Pinia store for a specific Strapi collection.
 * @param {string} dataName - The name of the Strapi collection (e.g., "events", "pois").
 * @returns A Pinia store definition.
 */
export const strapiStoreBuilder = <T extends HasDocumentId>(dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<T[]> = ref([])

  /**
   * Fetches a list of items from the Strapi collection and populates the store.
   */
  async function getList() {
    try {
      const response = await strapi.find(dataName, { populate: '*' })
      datas.value = response.data as unknown as T[]
    } catch (error) {
      console.error(`Error fetching ${dataName}:`, error)
    }
  }

  /**
   * Fetches a single item by its ID from the Strapi collection.
   * If the item is already in the store, it's updated. Otherwise, it's added to the store.
   * @param {string} id - The ID of the item to fetch.
   * @returns {Promise<T | undefined>} A promise that resolves to the fetched item, or undefined if an error occurs.
   */
    async function get(id: string): Promise<T | undefined> {
    try {
      const response = await strapi.findOne(dataName, id, { populate: '*' })

      const index = datas.value.findIndex(item => item.documentId === id)
      if (index !== -1) {
        datas.value[index] = response.data as unknown as T
      } else {
        datas.value.push(response.data as unknown as T)
      }

      return datas.value.find(item => item.documentId === id)
    } catch (error) {
      console.error(`Error fetching event (${id}):`, error)
    }
  }

  /**
   * Creates a new item in the Strapi collection.
   * @param {any} item - The item to create.
   * @returns {Promise<any | undefined>} A promise that resolves to the created item, or undefined if an error occurs.
   */
    async function create(item: any) {
    try {
      const response = await strapi.create(dataName, item );
      datas.value.push(response.data as unknown as T);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${dataName}:`, error);
    }
  }

  /**
   * Updates an item in the Strapi collection.
   * @param {string} id - The ID of the item to update.
   * @param {any} item - The updated item data.
   * @returns {Promise<any | undefined>} A promise that resolves to the updated item, or undefined if an error occurs.
   */
    async function update(id: string, item: any) {
    try {
      const response = await strapi.update(dataName, id,  item );
      const index = datas.value.findIndex(item => item.documentId === id);
      if (index !== -1) {
        datas.value[index] = response.data as unknown as T;
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating ${dataName} (${id}):`, error);
    }
  }

  const result: {
    getList: () => Promise<void>;
    get: (id: string) => Promise<T | undefined>;
    create: (item: any) => Promise<any>;
    update: (id: string, item: any) => Promise<any>;
    datas: Ref<T[]>;
    [key: string]: any;
  } = { getList, get, create, update, datas }
  result[dataName] = datas

  return result as typeof result & { [key: string]: Ref<T[]> }
})
}

export const useEventsStore = strapiStoreBuilder<Event>("events")
export const usePoisStore = strapiStoreBuilder<Poi>("pois")
export const useProfilesStore = strapiStoreBuilder<Profile>("profiles")
export const useSportsStore = strapiStoreBuilder<Sport>("sports")
export const useUsersStore = strapiStoreBuilder<User>("users")