<template>
    <v-container>
        <h1 class="mb-4">Edit Profile</h1>
        <DynamicUpdateForm v-if="profile" :initial-data="profile" :model-class="Profile"
            :data-sources="{ sports: sportsList, events: eventsList }" title="Edit Profile" @save="saveProfile"
            @delete="deleteProfile" />
        <v-alert v-else type="info">Loading profile...</v-alert>
    </v-container>
</template>

<script setup lang="ts">
import { useProfilesStore, useSportsStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Profile } from '@/interfaces/profile'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const profilesStore = useProfilesStore()
const sportsStore = useSportsStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const profileId = computed(() => route.params.id ? String(route.params.id) : null)

const profile = ref<Partial<Profile> | null>(null)
const loading = ref(false)

const sportsList = computed(() => sportsStore.datas)
const eventsList = computed(() => eventsStore.datas)

const strapiObject = new StrapiObject<Profile>(
    profilesStore,
    notificationStore,
    router,
    'profiles',
    'Profile'
)

onMounted(async () => {
    await Promise.all([
        sportsStore.getList(),
        eventsStore.getList()
    ])

    if (profileId.value) {
        const fetchedProfile = await strapiObject.load(profileId.value)
        if (fetchedProfile) {
            profile.value = { ...fetchedProfile }
            // Map relations to IDs for the form
            // @ts-ignore
            if (fetchedProfile.sports) profile.value.sports = fetchedProfile.sports.map((s: any) => s.documentId)
            // @ts-ignore
            if (fetchedProfile.events) profile.value.events = fetchedProfile.events.map((e: any) => e.documentId)
        }
    } else {
        notificationStore.addNotification({ message: 'Invalid Profile ID', type: 'error' })
        router.push('/profiles')
    }
})

async function saveProfile(formData: any) {
    if (!profile.value || !profileId.value) return

    loading.value = true

    try {
        const payload = { ...formData };
        await strapiObject.save(payload, profileId.value)
    } finally {
        loading.value = false
    }
}

async function deleteProfile() {
    if (!profileId.value) return

    loading.value = true
    try {
        await strapiObject.delete(profileId.value)
    } finally {
        loading.value = false
    }
}
</script>
