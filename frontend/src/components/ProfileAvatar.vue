<template>
  <v-avatar :size="size" :color="photoUrl ? undefined : backgroundColor">
    <v-img v-if="photoUrl" :src="photoUrl" cover alt="Profile Photo"></v-img>
    <span v-else class="text-h5 font-weight-medium text-white">{{ initials }}</span>
  </v-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  photo: {
    type: Object,
    default: null
  },
  username: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 48
  }
});

const photoUrl = computed(() => {
  if (props.photo && props.photo.url) {
    return import.meta.env.VITE_STRAPI_URL + props.photo.url;
  }
  return null;
});

const initials = computed(() => {
  if (!props.username) return '?';
  return props.username.substring(0, 2).toUpperCase();
});

const backgroundColor = computed(() => {
  if (!props.documentId) return '#E0E0E0'; // Default grey
  
  // Generate a consistent color based on documentId
  let hash = 0;
  for (let i = 0; i < props.documentId.length; i++) {
    hash = props.documentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to HSL for better control over tone (pale/light)
  const hue = Math.abs(hash % 360);
  const saturation = 70; // High saturation for vibrancy
  const lightness = 80;  // High lightness for pastel/pale look
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
});
</script>
