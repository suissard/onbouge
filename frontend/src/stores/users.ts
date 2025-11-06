import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useUserStore = defineStore('users', () => {
  const users: Ref<any[]> = ref([])

  async function getList() {
    try {
      const response = await strapi.list('users')
      users.value = response.data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

    async function get(id: string) {
    try {
      const response = await strapi.get('users', id)

      // remplace dans la collection, l'entree qui correspond
      const index = users.value.findIndex(item => item.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      } else {
        users.value.push(response.data)
      }

    } catch (error) {
      console.error(`Error fetching user (${id}):`, error)
    }
  }

  return { users, getList, get }
})
