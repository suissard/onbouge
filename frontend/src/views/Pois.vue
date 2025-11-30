<template>
  <v-container>
    <h1 class="mb-4">POIs</h1>
    <StrapiDataIterator
      :store="poiStore"
      :item-component="GenericCard"
      creation-route="/pois/new"
      :component-props-mapper="propsMapper"
    />
  </v-container>
</template>

<script setup lang="ts">
import { usePoisStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const poiStore = usePoisStore();

const propsMapper = (item: any) => ({
  title: item.title,
  description: item.description,
  route: `/pois/${item.documentId}`,
  showAvatar: true,
  avatarId: item.author?.documentId,
  avatarPhoto: item.author?.photo
});
</script>
