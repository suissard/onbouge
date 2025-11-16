<template>
  <v-container>
    <h1 class="mb-4">Tous les evenements</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <pre>{{ events }}</pre>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore';
import { ref, onMounted } from 'vue';

const eventStore = useEventsStore();
const events = ref([]);
const loading = ref(true);

onMounted(async () => {
  console.log('Events.vue mounted');
  await eventStore.getList();
  events.value = eventStore.datas;
  loading.value = false;
  console.log('Events:', events.value);
});
</script>
