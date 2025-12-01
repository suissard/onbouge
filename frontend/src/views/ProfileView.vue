<template>
    <v-container>
        <v-card v-if="profile">
            <v-card-title class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                    <ProfileAvatar :username="profile.username" :document-id="profile.documentId" :photo="profile.photo"
                        size="64" class="mr-4" />
                    <span class="text-h4">{{ profile.username }}</span>
                </div>
                <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn color="primary" :to="`/profiles/${profile.documentId}/edit`" prepend-icon="mdi-pencil"
                            :disabled="!authStore.canEdit(profile)" v-bind="props">
                            Edit
                        </v-btn>
                    </template>
                    <span>{{ authStore.canEdit(profile) ? 'Éditer' : 'Vous n\'avez pas la permission d\'éditer'
                    }}</span>
                </v-tooltip>
            </v-card-title>
            <v-card-text>
                <p>{{ profile.description }}</p>
                <div v-if="profile.sports && profile.sports.length > 0">
                    <h3 class="text-h6 mt-4">Sports</h3>
                    <v-chip-group>
                        <v-chip v-for="sport in profile.sports" :key="sport.documentId"
                            :to="`/sports/${sport.documentId}`">{{
                                sport.title
                            }}</v-chip>
                    </v-chip-group>
                </div>
                <div v-if="profile.events && profile.events.length > 0">
                    <h3 class="text-h6 mt-4">Events</h3>
                    <v-chip-group>
                        <v-chip v-for="event in profile.events" :key="event.documentId"
                            :to="`/events/${event.documentId}`">{{
                                event.title
                            }}</v-chip>
                    </v-chip-group>
                </div>
            </v-card-text>
        </v-card>
        <v-alert v-else type="info">Loading profile...</v-alert>
    </v-container>
</template>

<script setup lang="ts">
import { useProfilesStore } from '@/stores/strapiStore'
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Profile } from '@/interfaces/profile'
import ProfileAvatar from '@/components/ProfileAvatar.vue'

const profilesStore = useProfilesStore()
const authStore = useAuthStore()
const route = useRoute()
const profileId = String(route.params.id)
const profile = ref<Profile | null>(null)

onMounted(async () => {
    const fetchedProfile = await profilesStore.get(profileId)
    if (fetchedProfile) {
        profile.value = fetchedProfile as Profile
    }
})
</script>
