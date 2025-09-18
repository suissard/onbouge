<template>
  <div class="container">
    <div id="agenda-view" class="view active">
      <h2><CalendarIcon class="icon" /> Prochains Événements</h2>

      <div v-if="eventsStore.isLoading" class="loading-message">
        Chargement des événements...
      </div>

      <div v-if="eventsStore.error" class="error-message">
        {{ eventsStore.error }}
      </div>

      <div v-if="!eventsStore.isLoading && !eventsStore.error" id="agenda-list" class="card-list">
        <router-link v-for="event in eventsStore.events" :key="event.id" :to="`/event-view/${event.id}`" class="card-link">
          <div class="card">
            <div class="card-content">
              <h3><FlagIcon class="icon" /> {{ event.attributes.title }}</h3>
              <span class="date-badge">{{ new Date(event.attributes.date).toLocaleDateString('fr-FR') }}</span>
              <p>{{ event.attributes.description }}</p>
              <p class="location"><MapPinIcon class="icon" /> Lieu approximatif</p>
              <footer>
                <div class="participants">
                  <span>Participants:</span>
                  <div class="avatar-group">
                    <!-- This needs to be adapted based on actual data structure -->
                    <!-- <div v-for="p in (event.attributes.participants || [])" :key="p" class="avatar">{{ p }}</div> -->
                  </div>
                </div>
                <span class="no-forum">Forum non implémenté</span>
              </footer>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEventsStore } from '@/stores/events';
import { CalendarIcon, FlagIcon, MapPinIcon } from 'lucide-vue-next';

const eventsStore = useEventsStore();

onMounted(() => {
  eventsStore.fetchEvents();
});
</script>

<style scoped>
.container {
  padding: 1rem;
}
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.card-link {
  text-decoration: none;
  color: inherit;
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px_8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  height: 100%;
}
.card:hover {
    transform: translateY(-5px);
}
.card-content {
  padding: 1.5rem;
}
.date-badge {
    background-color: #e0f2fe;
    color: #0c4a6e;
    padding: 0.25rem 0.5rem;
    border-radius: 99px;
    font-size: 0.8rem;
    display: inline-block;
    margin-bottom: 1rem;
}
.location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    margin-top: 1rem;
}
.icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.5rem;
}
footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.loading-message, .error-message {
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
}
.error-message {
  color: red;
}
</style>
