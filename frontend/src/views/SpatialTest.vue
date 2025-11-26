<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Spatial Search Test</h1>

        <div class="mb-4 space-y-2">
            <div>
                <label class="block text-sm font-medium">Latitude</label>
                <input v-model="lat" type="number" step="any" class="border p-2 rounded w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium">Longitude</label>
                <input v-model="lng" type="number" step="any" class="border p-2 rounded w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium">Distance (km)</label>
                <input v-model="distance" type="number" class="border p-2 rounded w-full" />
            </div>
            <button @click="search" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Search
            </button>
        </div>

        <div v-if="loading" class="text-gray-500">Loading...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>

        <div v-else>
            <h2 class="text-xl font-semibold mb-2">Results ({{ results.length }})</h2>
            <ul class="space-y-2">
                <li v-for="poi in results" :key="poi.id" class="border p-3 rounded shadow-sm">
                    <div class="font-bold">{{ poi.title }}</div>
                    <div class="text-sm text-gray-600">
                        Distance: {{ (poi.distance / 1000).toFixed(2) }} km
                    </div>
                    <div class="text-xs text-gray-500">
                        Coords: {{ poi.latitude }}, {{ poi.longitude }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import configs from '@/services/configs.json';

const lat = ref(48.8566); // Default: Paris
const lng = ref(2.3522);
const distance = ref(10);
const results = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const search = async () => {
    loading.value = true;
    error.value = null;
    results.value = [];

    try {
        const response = await fetch(
            `${configs.strapiIp}/api/pois/spatial-search?lat=${lat.value}&lng=${lng.value}&distance=${distance.value}`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        results.value = data;
    } catch (err: any) {
        error.value = err.message || 'An error occurred';
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>
