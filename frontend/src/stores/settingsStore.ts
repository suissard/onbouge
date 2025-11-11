
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useNotificationsStore } from './notificationStore';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const useStrapiMock = ref(localStorage.getItem('useStrapiMock') === 'true' || false);
  const theme = ref(localStorage.getItem('theme') || 'light');
  const colors = ref(JSON.parse(localStorage.getItem('themeColors') || '{}'));

  // Watchers to update localStorage
  watch(useStrapiMock, (value) => {
    localStorage.setItem('useStrapiMock', String(value));
  });

  watch(theme, (value) => {
    localStorage.setItem('theme', value);
  });

  watch(colors, (value) => {
    localStorage.setItem('themeColors', JSON.stringify(value));
  }, { deep: true });

  // Actions
  function setUseStrapiMock(value: boolean) {
    useStrapiMock.value = value;
    const notificationsStore = useNotificationsStore();
    notificationsStore.addNotification({
      message: 'Reload the page for the Strapi mock setting to take effect.',
      type: 'info',
    });
  }

  function setTheme(newTheme: string) {
    theme.value = newTheme;
  }

  function setColors(newColors: any) {
    colors.value = newColors;
  }

  return {
    useStrapiMock,
    theme,
    colors,
    setUseStrapiMock,
    setTheme,
    setColors,
  };
});
