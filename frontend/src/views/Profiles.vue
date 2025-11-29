<template>
  <v-container>
    <h1 class="mb-4">Profiles</h1>
    <StrapiDataIterator :store="profilesStore" :item-component="GenericCard" :component-props-mapper="propsMapper"
      sort-key="username" />
  </v-container>
</template>

<script setup lang="ts">
import { useProfilesStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const profilesStore = useProfilesStore();

const propsMapper = (item: any) => ({
  title: item.username,
  description: item.description,
  route: `/profiles/${item.documentId}`
});
</script>
