import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const strapiStoreBuilder = (dataName: string) => {
 return defineStore(dataName, () => {
  const datas: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.get(dataName+"?populate=*", true)
      // console.log("strapiStore.getList()", response.data?.data || response.data)
      datas.value = response.data?.data || response.data
    } catch (error) {
      console.error(`Error fetching ${dataName}:`, error)
    }
  }

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