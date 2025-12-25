<template>
    <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
            <!-- Sidebar for Controls and Results -->
            <v-col cols="12" md="4" lg="3" class="d-flex flex-column border-e">
                <v-card flat class="pa-4 rounded-0 bg-grey-lighten-4">
                    <h1 class="text-h5 font-weight-bold mb-4 text-primary">Spatial Search</h1>

                    <v-form @submit.prevent="search">
                        <v-row dense>
                            <v-col cols="6">
                                <v-text-field v-model.number="lat" label="Latitude" type="number" step="any"
                                    variant="outlined" density="compact" hide-details="auto"
                                    class="mb-2"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model.number="lng" label="Longitude" type="number" step="any"
                                    variant="outlined" density="compact" hide-details="auto"
                                    class="mb-2"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model.number="distance" label="Radius (km)" type="number"
                                    variant="outlined" density="compact" hide-details="auto" class="mb-4"
                                    prepend-inner-icon="mdi-radius"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn type="submit" color="primary" block :loading="loading" prepend-icon="mdi-magnify">
                            Search Area
                        </v-btn>
                    </v-form>
                </v-card>

                <v-divider></v-divider>

                <!-- Results List -->
                <div class="flex-grow-1 overflow-y-auto">
                    <div v-if="loading" class="d-flex justify-center align-center h-100 pa-4">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>

                    <div v-else-if="error" class="pa-4 text-error">
                        <v-alert type="error" variant="tonal" density="compact">
                            {{ error }}
                        </v-alert>
                    </div>

                    <div v-else-if="results.length === 0" class="pa-4 text-center text-medium-emphasis">
                        <v-icon icon="mdi-map-marker-off" size="large" class="mb-2"></v-icon>
                        <p>No POIs found in this area.</p>
                    </div>

                    <v-list v-else lines="two" class="pa-0">
                        <v-list-subheader>Found {{ results.length }} POIs</v-list-subheader>
                        <v-list-item v-for="poi in (results as any[])" :key="poi.documentId" :title="poi.title"
                            :subtitle="`${((poi as any).distance / 1000).toFixed(2)} km away`" @click="focusOnPoi(poi)"
                            link>
                            <template v-slot:prepend>
                                <v-avatar color="primary" variant="tonal" size="small">
                                    <v-icon icon="mdi-map-marker"></v-icon>
                                </v-avatar>
                            </template>
                            <template v-slot:append>
                                <v-icon icon="mdi-chevron-right" size="small"></v-icon>
                            </template>
                        </v-list-item>
                    </v-list>
                </div>
            </v-col>

            <!-- Map Area -->
            <v-col cols="12" md="8" lg="9" class="position-relative">
                <div style="height: 100%; width: 100%;">
                    <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false">
                        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                            name="OpenStreetMap"></l-tile-layer>

                        <!-- Search Center Marker -->
                        <l-circle :lat-lng="[lat, lng]" :radius="distance * 1000" color="blue" :fill="true"
                            :fillOpacity="0.1"></l-circle>
                        <l-marker :lat-lng="[lat, lng]">
                            <l-popup>Search Center</l-popup>
                        </l-marker>

                        <!-- POI Markers -->
                        <l-marker v-for="poi in (results as any[])" :key="poi.documentId"
                            :lat-lng="[poi.latitude, poi.longitude]">
                            <l-popup>
                                <div class="text-subtitle-2 font-weight-bold">{{ poi.title }}</div>
                                <div class="text-caption">{{ poi.description }}</div>
                                <div class="text-caption mt-1 text-primary">
                                    {{ ((poi as any).distance / 1000).toFixed(2) }} km away
                                </div>
                            </l-popup>
                        </l-marker>
                    </l-map>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePoisStore } from '@/stores/strapiStore';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup, LCircle } from '@vue-leaflet/vue-leaflet';

const poisStore = usePoisStore();
const lat = ref(48.8566); // Default: Paris
const lng = ref(2.3522);
const distance = ref(10);
const results = computed(() => poisStore.datas);
const loading = ref(false);
const error = ref<string | null>(null);

// Map state
const zoom = ref(11);
const center = computed(() => [lat.value, lng.value]);

const search = async () => {
    loading.value = true;
    error.value = null;

    try {
        await poisStore.spatialSearch(lat.value, lng.value, distance.value);
    } catch (err: any) {
        error.value = err.message || 'An error occurred';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const focusOnPoi = (poi: any) => {
    // Logic to center map on POI could go here if we exposed the map instance
    // For now, simple reactivity on center might be enough, but we usually want to keep search center as map center
    // or maybe change center to POI temporarily.
    // Let's just log for now or maybe set center (but that moves the search circle context visually)
    // center.value = [poi.latitude, poi.longitude]; 
};
</script>

<style scoped>
/* Ensure map container takes full height */
:deep(.leaflet-container) {
    height: 100%;
    width: 100%;
    z-index: 1;
}
</style>
