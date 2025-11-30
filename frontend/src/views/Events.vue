<template>
  <v-container>
    <h1 class="mb-4">Events</h1>
    <StrapiDataIterator
      :store="eventStore"
      :item-component="GenericCard"
      creation-route="/events/new"
      :component-props-mapper="propsMapper"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const eventStore = useEventsStore();

const propsMapper = (item: any) => ({
  title: item.title,
  description: item.description,
  route: `/events/${item.documentId}`,
  showAvatar: true,
  avatarId: item.author?.documentId,
  avatarPhoto: item.author?.photo
});
</script>
