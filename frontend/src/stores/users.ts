import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import strapi from '@/services/strapi'

export const useUserStore = defineStore('users', () => {
  const users: Ref<any[]> = ref([])

  async function fetchUsers() {
    try {
      const { data } = await strapi.find('users')
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  return { users, fetchUsers }
})
