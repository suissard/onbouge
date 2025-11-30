<template>
  <v-container>
    <h1 class="mb-4">Edit User</h1>
    <DynamicUpdateForm v-if="user" :initial-data="user" :model-class="User" :data-sources="{ profiles: profilesList, roles: rolesList }"
      title="Edit User" @save="saveUser" @delete="deleteUser" />
    <v-alert v-else type="info">Loading user...</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore, useProfilesStore, useRolesStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User } from '@/interfaces/user'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const userStore = useUsersStore()
const profilesStore = useProfilesStore()
const rolesStore = useRolesStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
// In previous code userId was number, but strapiStore uses documentId (string) now.
// Assuming route param is documentId.
const userId = computed(() => route.params.id ? String(route.params.id) : null)

const user = ref<Partial<User> | null>(null)
const loading = ref(false)

const profilesList = computed(() => profilesStore.datas)
const rolesList = computed(() => rolesStore.datas)

const strapiObject = new StrapiObject<User>(
  userStore,
  notificationStore,
  router,
  'profiles',
  'User'
)

onMounted(async () => {
  await profilesStore.getList()
  await rolesStore.getList()

  if (userId.value) {
    const fetchedUser = await strapiObject.load(userId.value)
    if (fetchedUser) {
      user.value = { ...fetchedUser }
      // @ts-ignore
      if (fetchedUser.profiles) user.value.profiles = fetchedUser.profiles.map((p: any) => p.documentId)
      // @ts-ignore
      if (fetchedUser.role) user.value.role = fetchedUser.role.id
    }
  } else {
    notificationStore.addNotification({ message: 'Invalid User ID', type: 'error' })
    router.push('/profiles')
  }
})

/**
 * Saves the user data and navigates to the user view page.
 */
async function saveUser(formData: any) {
  if (!user.value || !userId.value) return

  loading.value = true

  try {
    const payload = { ...formData };
    await strapiObject.save(payload, userId.value)
  } finally {
    loading.value = false
  }
}

async function deleteUser(formData: any) {
  if (!userId.value) return

  loading.value = true
  try {
    await strapiObject.delete(userId.value)
  } finally {
    loading.value = false
  }
}
</script>
