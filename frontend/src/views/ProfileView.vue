<template>
    <v-container>
        <v-card v-if="profile">
            <v-card-title class="text-h4">{{ profile.username }}</v-card-title>
            <v-card-text>
                <p>{{ profile.description }}</p>
                <div v-if="profile.sports && profile.sports.length > 0">
                    <h3 class="text-h6 mt-4">Sports</h3>
                    <v-chip-group>
                        <v-chip v-for="sport in profile.sports" :key="sport.id" :to="`/sports/${sport.documentId}`">{{
                            sport.title
                            }}</v-chip>
                    </v-chip-group>
                </div>
                <div v-if="profile.events && profile.events.length > 0">
                    <h3 class="text-h6 mt-4">Events</h3>
                    <v-chip-group>
                        <v-chip v-for="event in profile.events" :key="event.id" :to="`/events/${event.documentId}`">{{
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const profilesStore = useProfilesStore()
const route = useRoute()
const profileId = String(route.params.id)
const profile = ref<any>(null)

onMounted(async () => {
    profile.value = await profilesStore.get(profileId)
})
</script>
