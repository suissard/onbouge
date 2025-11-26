<template>
  <v-container>
    <h1 class="mb-4">Sports</h1>
    <StrapiDataIterator :store="sportStore" :item-component="GenericCard" creation-route="/sports/new"
      :component-props-mapper="propsMapper" />
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const sportStore = useSportsStore();

const propsMapper = (item: any) => ({
  title: item.title,
  description: item.description,
  route: `/sports/${item.documentId}`
});
</script>
