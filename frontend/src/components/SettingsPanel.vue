<template>
  <v-navigation-drawer :model-value="modelValue" @update:model-value="updateModelValue" temporary>
    <v-list-item>
        <v-list-item-title class="text-h6">
          Settings
        </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense>
      <v-list-item>
        <v-switch
          v-model="useStrapiMock"
          label="Use Strapi Mock"
        ></v-switch>
      </v-list-item>

      <v-list-item>
        <v-switch
          v-model="isDarkTheme"
          label="Dark Theme"
        ></v-switch>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-subheader>Theme Colors</v-list-subheader>

      <v-list-item>
        <v-text-field
          v-model="primaryColor"
          label="Primary Color"
        >
          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :color="primaryColor" icon="mdi-eyedropper-variant"></v-btn>
              </template>
              <v-color-picker v-model="primaryColor"></v-color-picker>
            </v-menu>
          </template>
        </v-text-field>
      </v-list-item>

       <v-list-item>
         <v-text-field
          v-model="secondaryColor"
          label="Secondary Color"
        >
          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :color="secondaryColor" icon="mdi-eyedropper-variant"></v-btn>
              </template>
              <v-color-picker v-model="secondaryColor"></v-color-picker>
            </v-menu>
          </template>
        </v-text-field>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const settingsStore = useSettingsStore();

const updateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const useStrapiMock = computed({
  get: () => settingsStore.useStrapiMock,
  set: (value) => settingsStore.setUseStrapiMock(value),
});

const isDarkTheme = computed({
  get: () => settingsStore.theme === 'dark',
  set: (value) => settingsStore.setTheme(value ? 'dark' : 'light'),
});

const primaryColor = computed({
    get: () => settingsStore.colors.primary || '#1976D2', // Default color
    set: (value) => {
        const newColors = { ...settingsStore.colors, primary: value };
        settingsStore.setColors(newColors);
    }
});

const secondaryColor = computed({
    get: () => settingsStore.colors.secondary || '#424242', // Default color
    set: (value) => {
        const newColors = { ...settingsStore.colors, secondary: value };
        settingsStore.setColors(newColors);
    }
});
</script>
