<template>
  <v-container>
    <h1 class="mb-4">Users</h1>
    <StrapiDataIterator :store="userStore" :item-component="GenericCard" :component-props-mapper="propsMapper"
      sort-key="username" />
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import GenericCard from '@/components/GenericCard.vue';

const userStore = useUsersStore();

const propsMapper = (item: any) => ({
  title: item.username,
  description: item.email,
  route: `/users/${item.documentId}`
});
</script>
