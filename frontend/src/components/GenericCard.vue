<template>
  <v-card class="ma-2" hover @click="navigate">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <p class="description">{{ truncatedDescription }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  route: {
    type: String,
    required: true
  }
});

const router = useRouter();

const navigate = () => {
  router.push(props.route);
};

const truncatedDescription = computed(() => {
  if (props.description.length > 100) {
    return props.description.substring(0, 100) + '...';
  }
  return props.description;
});
</script>

<style scoped>
.description {
  min-height: 4.5em;
  max-height: 4.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
