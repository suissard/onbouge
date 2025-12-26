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

    <!-- Image Processing Modal -->
    <v-dialog v-model="showModal" max-width="600px" persistent>
      <v-card title="Optimize Image">
        <v-card-text>
          <div class="d-flex flex-column align-center mb-4">
            <div class="preview-container mb-4"
              :style="{ width: '100%', aspectRatio: targetWidth / targetHeight, maxHeight: '400px' }"
              @mousedown="startDrag" @touchstart="startDrag" @mousemove="onDrag" @touchmove="onDrag" @mouseup="endDrag"
              @mouseleave="endDrag" @touchend="endDrag">
              <v-img v-if="modalPreviewUrl" :src="modalPreviewUrl" contain class="rounded border pointer-move"
                draggable="false">
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </div>

            <div class="text-caption" v-if="processedSize">
              Target: <strong>{{ targetWidth }}x{{ targetHeight }}</strong> |
              Size: <strong>{{ (processedSize / 1024).toFixed(1) }} KB</strong>
              <span v-if="processedSize > maxSizeMB * 1024 * 1024" class="text-error ml-2">(Exceeds {{ maxSizeMB
                }}MB)</span>
            </div>
          </div>

          <v-slider v-model="internalZoom" label="Zoom" min="1" max="4" step="0.1" thumb-label="always"
            prepend-icon="mdi-magnify-plus" @update:model-value="debouncedProcess"></v-slider>

          <v-slider v-model="internalQualityPercent" label="Quality" min="10" max="100" step="5" thumb-label="always"
            prepend-icon="mdi-image-filter-none" suffix="%" @update:model-value="debouncedProcess"></v-slider>

          <div class="text-caption text-center text-grey">
            <v-icon size="small">mdi-cursor-move</v-icon> Drag the image to adjust position
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelModal">Cancel</v-btn>
          <v-btn color="primary" :disabled="!processedBlob || processedSize > maxSizeMB * 1024 * 1024"
            @click="confirmAndUpload">Confirm & Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import strapi from '@/services/strapi';
import configs from '@config';
import { processImage } from '@/utils/imageProcessor';

const props = defineProps({
  initialPhoto: {
    type: Object,
    default: null
  },
  targetWidth: {
    type: Number,
    default: 1024
  },
  targetHeight: {
    type: Number,
    default: 1024
  },
  maxSizeMB: {
    type: Number,
    default: 2
  },
  quality: {
    type: Number,
    default: 0.8
  }
});

const emit = defineEmits(['update:photo', 'upload-complete']);

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>('');
const uploading = ref(false);
const error = ref('');

// Modal state
const showModal = ref(false);
const originalFile = ref<File | null>(null);
const modalPreviewUrl = ref<string>('');
const processedBlob = ref<Blob | null>(null);
const processedSize = ref(0);
const modalProcessing = ref(false);

const internalZoom = ref(1);
const internalQualityPercent = ref(props.quality * 100);
const internalOffsetX = ref(0.5);
const internalOffsetY = ref(0.5);

// Drag state
const isDragging = ref(false);
const lastMousePos = { x: 0, y: 0 };

let debounceTimer: any = null;

// Initialize preview if initial photo exists
watch(() => props.initialPhoto, (newPhoto) => {
  if (newPhoto && newPhoto.url) {
    previewUrl.value = configs.strapiIp + newPhoto.url;
  }
}, { immediate: true });

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  error.value = '';
  originalFile.value = file;

  // Reset settings
  internalZoom.value = 1;
  internalQualityPercent.value = props.quality * 100;
  internalOffsetX.value = 0.5;
  internalOffsetY.value = 0.5;

  showModal.value = true;
  await startProcessing();
};

const debouncedProcess = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    startProcessing();
  }, 150); // Faster debounce for dragging
}

const startProcessing = async () => {
  if (!originalFile.value) return;

  modalProcessing.value = true;
  try {
    const result = await processImage(originalFile.value, {
      targetWidth: props.targetWidth,
      targetHeight: props.targetHeight,
      quality: internalQualityPercent.value / 100,
      zoom: internalZoom.value,
      offsetX: internalOffsetX.value,
      offsetY: internalOffsetY.value
    });

    processedBlob.value = result;
    processedSize.value = result.size;

    if (modalPreviewUrl.value) URL.revokeObjectURL(modalPreviewUrl.value);
    modalPreviewUrl.value = URL.createObjectURL(result);

  } catch (err) {
    console.error('Processing error:', err);
  } finally {
    modalProcessing.value = false;
  }
}

// Drag Handlers
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  const pos = 'touches' in e ? e.touches[0] : e;
  lastMousePos.x = pos.clientX;
  lastMousePos.y = pos.clientY;
};

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  const pos = 'touches' in e ? e.touches[0] : e;
  const dx = pos.clientX - lastMousePos.x;
  const dy = pos.clientY - lastMousePos.y;

  lastMousePos.x = pos.clientX;
  lastMousePos.y = pos.clientY;

  // Sensitivity factor relative to zoom and quality
  // We adjust offsetX/offsetY which are 0-1
  // Higher zoom means more room to move, so sensitivity should be lower relative to total pixel movement
  const sensitivity = 0.005 / internalZoom.value;

  internalOffsetX.value = Math.max(0, Math.min(1, internalOffsetX.value - dx * sensitivity));
  internalOffsetY.value = Math.max(0, Math.min(1, internalOffsetY.value - dy * sensitivity));

  debouncedProcess();
};

const endDrag = () => {
  isDragging.value = false;
};

const cancelModal = () => {
  showModal.value = false;
  originalFile.value = null;
  if (modalPreviewUrl.value) URL.revokeObjectURL(modalPreviewUrl.value);
  modalPreviewUrl.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

const confirmAndUpload = async () => {
  if (!processedBlob.value || !originalFile.value) return;

  showModal.value = false;
  uploading.value = true;
  previewUrl.value = modalPreviewUrl.value;

  const file = new File([processedBlob.value], originalFile.value.name, { type: 'image/jpeg' });
  await uploadPhoto(file);

  originalFile.value = null;
}

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

.pointer-move {
  cursor: move;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.text-error {
  color: rgb(var(--v-theme-error));
}
</style>
