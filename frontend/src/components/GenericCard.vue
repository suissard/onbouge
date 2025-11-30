<template>
  <v-card class="ma-2" hover @click="navigate">
    <v-card-title class="d-flex align-center">
      <ProfileAvatar v-if="showAvatar" :username="title" :document-id="avatarId" :photo="avatarPhoto" size="40"
        class="mr-3" />
      {{ title }}
    </v-card-title>
    <v-card-text>
      <p class="description">{{ truncatedDescription }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ProfileAvatar from './ProfileAvatar.vue';

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
  },
  showAvatar: {
    type: Boolean,
    default: false
  },
  avatarId: {
    type: String,
    default: ''
  },
  avatarPhoto: {
    type: Object,
    default: null
  }
});

const router = useRouter();

const navigate = () => {
  router.push(props.route);
};

const truncatedDescription = computed(() => {
  const desc = props.description || '';
  if (desc.length > 100) {
    return desc.substring(0, 100) + '...';
  }
  return desc;
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
