<template>
  <div class="d-flex flex-column align-center">
    <v-avatar size="150" class="mb-4 cursor-pointer" @click="triggerFileInput" color="grey-lighten-2">
      <v-img v-if="previewUrl" :src="previewUrl" cover></v-img>
      <v-icon v-else size="64" color="grey-darken-2">mdi-camera</v-icon>
    </v-avatar>

    <v-btn variant="text" color="primary" @click="triggerFileInput" :loading="uploading">
      {{ previewUrl ? 'Change Photo' : 'Upload Photo' }}
    </v-btn>

    <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="handleFileChange" />

    <v-alert v-if="error" type="error" density="compact" class="mt-2" closable @click:close="error = ''">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import strapi from '@/services/strapi';
import { useEventsStore } from '@/stores/strapiStore';

const props = defineProps({
  initialPhoto: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:photo', 'upload-complete']);

const eventsStore = useEventsStore();
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>('');
const uploading = ref(false);
const error = ref('');

// Initialize preview if initial photo exists
watch(() => props.initialPhoto, (newPhoto) => {
  if (newPhoto && newPhoto.url) {
    previewUrl.value = eventsStore.strapiIp + newPhoto.url;
  }
}, { immediate: true });

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Create local preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Upload to Strapi
  await uploadPhoto(file);
};

const uploadPhoto = async (file: File) => {
  uploading.value = true;
  error.value = '';

  const formData = new FormData();
  formData.append('files', file);

  try {
    const response = await strapi.request('POST', '/upload', {
      body: formData,
    });

    let uploadedFile;
    if (Array.isArray(response) && response.length > 0) {
      uploadedFile = response[0];
    } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      uploadedFile = response.data[0];
    } else if (response.id) {
      uploadedFile = response;
    }

    if (uploadedFile) {
      emit('update:photo', uploadedFile);
      emit('upload-complete', uploadedFile);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    error.value = 'Failed to upload photo. Please try again.';
  } finally {
    uploading.value = false;
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
