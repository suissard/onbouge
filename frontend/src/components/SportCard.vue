<template>
  <v-card class="ma-2" hover @click="navigate">
    <v-card-title>{{ item.name }}</v-card-title>
    <v-card-text>
      Cliquez pour voir les détails.
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const router = useRouter();

const navigate = () => {
  // Assuming the item from strapi has a documentId after being processed by the store
  if (props.item.documentId) {
    router.push(`/sports/${props.item.documentId}`);
  }
};
</script>
