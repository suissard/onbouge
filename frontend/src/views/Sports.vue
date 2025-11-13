<template>
  <v-container>
    <h1 class="mb-4">Sports</h1>
    <StrapiDataIterator :store="sportStore" :item-component="SportCard" />
  </v-container>
</template>

<script setup lang="ts">
import { useSportsStore } from '@/stores/strapiStore';
import StrapiDataIterator from '@/components/StrapiDataIterator.vue';
import SportCard from '@/components/SportCard.vue';

const sportStore = useSportsStore();

</script>
