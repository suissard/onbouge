<template>
  <v-container>
    <h1 class="mb-4">Activities</h1>
    <StrapiDataIterator :store="activityStore" :item-component="GenericCard" creation-route="/activities/new"
      :component-props-mapper="propsMapper" />
  </v-container>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const activityStore = useActivitiesStore();

const propsMapper = (item: any) => ({
  title: item.title,
  description: item.description,
  route: `/activities/${item.documentId}`
});
</script>
