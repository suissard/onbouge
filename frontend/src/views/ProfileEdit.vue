<template>
    <v-container>
        <h1 class="mb-4">Edit Profile</h1>
        <div v-if="profile" class="mb-6">
            <PhotoUpload :initial-photo="profile.photo" @upload-complete="handlePhotoUpload" />
        </div>
        <DynamicUpdateForm v-if="profile" :initial-data="profile" :model-class="Profile" title="Edit Profile"
            @save="saveProfile" @delete="deleteProfile" />
        <v-alert v-else type="info">Loading profile...</v-alert>
    </v-container>
</template>

<script setup lang="ts">
import { useProfilesStore, useActivitiesStore, useEventsStore } from '@/stores/strapiStore'
import { useNotificationsStore } from '@/stores/notificationStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Profile } from '@/interfaces/profile'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'
import { StrapiObject } from '@/classes/StrapiObject'

const profilesStore = useProfilesStore()
const activitiesStore = useActivitiesStore()
const eventsStore = useEventsStore()
const notificationStore = useNotificationsStore()
const route = useRoute()
const router = useRouter()
const profileId = computed(() => route.params.id ? String(route.params.id) : null)

const profile = ref<Partial<Profile> | null>(null)
const loading = ref(false)

const strapiObject = new StrapiObject<Profile>(
    profilesStore,
    notificationStore,
    router,
    'profiles',
    'Profile'
)

onMounted(async () => {

    if (profileId.value) {
        const fetchedProfile = await strapiObject.load(profileId.value)
        if (fetchedProfile) {
            profile.value = { ...fetchedProfile }
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
        if (profile.value.photo && profile.value.photo.id) {
            payload.photo = profile.value.photo.id;
        }
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

function handlePhotoUpload(file: any) {
    console.log('handlePhotoUpload', file);
    if (profile.value) {
        profile.value.photo = file;
    }
}
</script>
