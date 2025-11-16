import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'
import type { Event } from '@/interfaces/event'
import type { Poi } from '@/interfaces/poi'
import type { Profile } from '@/interfaces/profile'
import type { Sport } from '@/interfaces/sport'
import type { User } from '@/interfaces/user'

interface StrapiObject {
  id: number;
  attributes: any;
}

interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

const flatten = (data: StrapiObject | null) => {
  if (!data) return null;
  return {
    id: data.id,
    ...data.attributes
  };
};

const flattenCollection = (data: StrapiObject[]) => {
  if (!data) return [];
  return data.map(item => flatten(item));
}

/**
 * A factory function to create a Pinia store for a specific Strapi collection.
 * @param {string} dataName - The name of the Strapi collection (e.g., "events", "pois").
 * @returns A Pinia store definition.
 */
export const strapiStoreBuilder = <T extends { id: number }>(dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<T[]> = ref([])

  /**
   * Fetches a list of items from the Strapi collection and populates the store.
   */
  async function getList() {
    try {
      const response = await strapi.collection(dataName).find({ populate: '*' });
      console.log('Raw response:', response.data);
      const flattened = flattenCollection(response.data) as T[];
      console.log('Flattened data:', flattened);
      datas.value = flattened;
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
      const response = await strapi.collection(dataName).findOne(id, { populate: '*' });
      const flattenedData = flatten(response.data) as T;

      if (!flattenedData) return undefined;

      const numericId = Number(id);
      const index = datas.value.findIndex(item => item.id === numericId);
      if (index !== -1) {
        datas.value[index] = flattenedData;
      } else {
        datas.value.push(flattenedData);
      }

      return datas.value.find(item => item.id === numericId);
    } catch (error) {
      console.error(`Error fetching ${dataName} (${id}):`, error);
    }
  }

  /**
   * Creates a new item in the Strapi collection.
   * @param {any} item - The item to create.
   * @returns {Promise<any | undefined>} A promise that resolves to the created item, or undefined if an error occurs.
   */
    async function create(item: any) {
    try {
      const response = await strapi.collection(dataName).create(item);
      const flattenedData = flatten(response.data) as T;
      if (flattenedData) {
        datas.value.push(flattenedData);
      }
      return flattenedData;
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
      const response = await strapi.collection(dataName).update(id, item);
      const flattenedData = flatten(response.data) as T;

      if (!flattenedData) return undefined;

      const numericId = Number(id);
      const index = datas.value.findIndex(item => item.id === numericId);
      if (index !== -1) {
        datas.value[index] = flattenedData;
      }
      return flattenedData;
    } catch (error)      {
      console.error(`Error updating ${dataName} (${id}):`, error);
    }
  }

  const result = { getList, get, create, update, datas }
  result[dataName] = datas

  return result as typeof result & { [key: string]: Ref<T[]> }
})
}

export const useEventsStore = strapiStoreBuilder<Event>("events")
export const usePoisStore = strapiStoreBuilder<Poi>("pois")
export const useProfilesStore = strapiStoreBuilder<Profile>("profiles")
export const useSportsStore = strapiStoreBuilder<Sport>("sports")
export const useUsersStore = strapiStoreBuilder<User>("users")
