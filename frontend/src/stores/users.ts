import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

export const useUserStore = defineStore('users', () => {
  const users: Ref<any[]> = ref([])

  async function fetchUsers() {
    try {
      const response = await fetch('/data/users.json')
      const data = await response.json()
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  return { users, fetchUsers }
})
